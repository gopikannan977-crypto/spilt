import {
  CurrencyCode,
  Expense,
  ExpenseParticipant,
  MemberBalance,
  Settlement,
  SimplifiedTransaction,
  SphereBalancesResponse,
  SplitMethod,
  SplitSenseAnalysis,
  User,
} from '../types';
import { formatCurrency } from './currency';

/**
 * Calculates equal splits for a total amount among participants.
 * Distributes integer remainders so the sum of participant shares EXACTLY equals total amount.
 */
export function calculateEqualSplit(
  totalMinor: number,
  participantUserIds: string[]
): { userId: string; shareAmount: number }[] {
  const count = participantUserIds.length;
  if (count === 0) return [];
  
  const baseShare = Math.floor(totalMinor / count);
  const remainder = totalMinor % count;

  return participantUserIds.map((userId, index) => {
    // First 'remainder' people absorb 1 extra minor unit (e.g. 1 paisa)
    const extra = index < remainder ? 1 : 0;
    return {
      userId,
      shareAmount: baseShare + extra,
    };
  });
}

/**
 * Calculates percentage splits with roundoff protection.
 */
export function calculatePercentageSplit(
  totalMinor: number,
  percentages: { userId: string; percentage: number }[]
): { userId: string; shareAmount: number; percentage: number }[] {
  let accumulated = 0;
  const result: { userId: string; shareAmount: number; percentage: number }[] = [];

  for (let i = 0; i < percentages.length; i++) {
    const item = percentages[i];
    if (i === percentages.length - 1) {
      // Last person absorbs rounding gap so sum(shareAmount) === totalMinor
      const finalShare = totalMinor - accumulated;
      result.push({
        userId: item.userId,
        shareAmount: Math.max(0, finalShare),
        percentage: item.percentage,
      });
    } else {
      const share = Math.round((totalMinor * item.percentage) / 100);
      accumulated += share;
      result.push({
        userId: item.userId,
        shareAmount: share,
        percentage: item.percentage,
      });
    }
  }

  return result;
}

/**
 * Calculates shares split proportionally.
 */
export function calculateSharesSplit(
  totalMinor: number,
  sharesList: { userId: string; shares: number }[]
): { userId: string; shareAmount: number; shares: number }[] {
  const totalShares = sharesList.reduce((acc, s) => acc + (s.shares || 0), 0);
  if (totalShares === 0) {
    return sharesList.map((s) => ({ userId: s.userId, shareAmount: 0, shares: s.shares }));
  }

  let accumulated = 0;
  const result: { userId: string; shareAmount: number; shares: number }[] = [];

  for (let i = 0; i < sharesList.length; i++) {
    const item = sharesList[i];
    if (i === sharesList.length - 1) {
      const finalShare = totalMinor - accumulated;
      result.push({
        userId: item.userId,
        shareAmount: Math.max(0, finalShare),
        shares: item.shares,
      });
    } else {
      const share = Math.round((totalMinor * (item.shares / totalShares)));
      accumulated += share;
      result.push({
        userId: item.userId,
        shareAmount: share,
        shares: item.shares,
      });
    }
  }

  return result;
}

/**
 * Core Balance Engine:
 * For every user:
 * netBalance = (Total money paid by user for expenses) - (Total share owed by user across all expenses)
 *              + (Total settlements paid to user) - (Total settlements paid by user)
 * 
 * If netBalance > 0: user should receive money (creditor).
 * If netBalance < 0: user owes money (debtor).
 * If netBalance === 0: user is completely settled.
 */
export function computeSphereBalances(
  members: { user: User }[],
  expenses: Expense[],
  settlements: Settlement[],
  currency: CurrencyCode = 'INR'
): SphereBalancesResponse {
  const userMap = new Map<string, User>();
  const totalPaidMap = new Map<string, number>();
  const totalOwedMap = new Map<string, number>();
  const netBalanceMap = new Map<string, number>();

  members.forEach((m) => {
    userMap.set(m.user.id, m.user);
    totalPaidMap.set(m.user.id, 0);
    totalOwedMap.set(m.user.id, 0);
    netBalanceMap.set(m.user.id, 0);
  });

  let totalSpent = 0;

  // Process expenses
  expenses.forEach((expense) => {
    totalSpent += expense.amount;
    const paidBy = expense.paidById;
    totalPaidMap.set(paidBy, (totalPaidMap.get(paidBy) || 0) + expense.amount);

    expense.participants.forEach((p) => {
      totalOwedMap.set(p.userId, (totalOwedMap.get(p.userId) || 0) + p.shareAmount);
    });
  });

  // Calculate raw net balance from expenses
  userMap.forEach((_, userId) => {
    const paid = totalPaidMap.get(userId) || 0;
    const owed = totalOwedMap.get(userId) || 0;
    netBalanceMap.set(userId, paid - owed);
  });

  // Apply settlements:
  // Settlement from A to B:
  // A paid B, so A's debt is reduced (A's net balance increases towards 0)
  // B received from A, so B's credit is reduced (B's net balance decreases towards 0)
  let settledAmount = 0;
  settlements.forEach((s) => {
    settledAmount += s.amount;
    const fromBal = netBalanceMap.get(s.fromUserId) || 0;
    const toBal = netBalanceMap.get(s.toUserId) || 0;
    netBalanceMap.set(s.fromUserId, fromBal + s.amount);
    netBalanceMap.set(s.toUserId, toBal - s.amount);
  });

  const memberBalances: MemberBalance[] = [];
  userMap.forEach((user, userId) => {
    memberBalances.push({
      userId,
      user,
      netBalance: netBalanceMap.get(userId) || 0,
      totalPaid: totalPaidMap.get(userId) || 0,
      totalOwed: totalOwedMap.get(userId) || 0,
    });
  });

  // Compute pending settlement volume (sum of all positive balances)
  const pendingSettlementsAmount = memberBalances
    .filter((b) => b.netBalance > 0)
    .reduce((sum, b) => sum + b.netBalance, 0);

  // Compute optimized settlements (minimum practical cash flow transactions)
  const optimizedSettlements = simplifyDebts(memberBalances, currency);

  // Calculate group settlement health score
  const healthScore = calculateSettlementHealth(expenses, settlements, memberBalances);

  return {
    sphereId: expenses[0]?.sphereId || '',
    currency,
    totalSpent,
    pendingSettlementsAmount,
    settledAmount,
    memberBalances,
    optimizedSettlements,
    healthScore,
  };
}

/**
 * Greedy Min-Cash-Flow Algorithm:
 * Converts arbitrary debt relationships into the minimum number of transactions (max N-1).
 */
export function simplifyDebts(
  balances: MemberBalance[],
  currency: CurrencyCode = 'INR'
): SimplifiedTransaction[] {
  // Separate into debtors (<0) and creditors (>0)
  const debtors: { user: User; amount: number }[] = [];
  const creditors: { user: User; amount: number }[] = [];

  balances.forEach((b) => {
    if (b.netBalance < -1) {
      debtors.push({ user: b.user, amount: -b.netBalance });
    } else if (b.netBalance > 1) {
      creditors.push({ user: b.user, amount: b.netBalance });
    }
  });

  // Sort descending by amount to settle largest amounts first
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: SimplifiedTransaction[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settled = Math.min(debtor.amount, creditor.amount);

    if (settled > 0) {
      transactions.push({
        fromUserId: debtor.user.id,
        toUserId: creditor.user.id,
        fromUser: debtor.user,
        toUser: creditor.user,
        amount: settled,
        currency,
      });
    }

    debtor.amount -= settled;
    creditor.amount -= settled;

    if (debtor.amount <= 1) {
      dIdx++;
    }
    if (creditor.amount <= 1) {
      cIdx++;
    }
  }

  return transactions;
}

/**
 * Unique Feature #5: Settlement Health Metric
 * Calculated from:
 * 1. Ratio of settled volume to total spending volume
 * 2. Unresolved pending debt count
 * 3. Age of oldest pending debt
 */
export function calculateSettlementHealth(
  expenses: Expense[],
  settlements: Settlement[],
  balances: MemberBalance[]
): SphereBalancesResponse['healthScore'] {
  const totalVolume = expenses.reduce((sum, e) => sum + e.amount, 0);
  const settledVolume = settlements.reduce((sum, s) => sum + s.amount, 0);
  const pendingDebtors = balances.filter((b) => b.netBalance < -50);
  const unresolvedCount = pendingDebtors.length;

  if (totalVolume === 0) {
    return {
      score: 100,
      status: 'Healthy',
      explanation: 'No pending debts. All shared accounts are balanced.',
      settledRatio: 1,
      unresolvedCount: 0,
      oldestPendingDays: 0,
    };
  }

  // Calculate age of oldest expense that still has pending debts
  let oldestPendingDays = 0;
  if (unresolvedCount > 0 && expenses.length > 0) {
    const sortedExpenses = [...expenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const oldest = sortedExpenses[0];
    const diffMs = Math.max(0, Date.now() - new Date(oldest.date).getTime());
    oldestPendingDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  // Scoring algorithm:
  // Base 100
  // Deduct based on pending ratio (up to 40 pts)
  // Deduct based on age of debt (up to 30 pts)
  // Deduct based on unresolved member count (up to 20 pts)
  const pendingVolume = balances.filter((b) => b.netBalance > 0).reduce((sum, b) => sum + b.netBalance, 0);
  const pendingRatio = totalVolume > 0 ? pendingVolume / totalVolume : 0;

  let score = 100;
  score -= Math.min(40, Math.round(pendingRatio * 40));

  if (oldestPendingDays > 30) {
    score -= 25;
  } else if (oldestPendingDays > 14) {
    score -= 15;
  } else if (oldestPendingDays > 7) {
    score -= 8;
  }

  score -= Math.min(20, unresolvedCount * 5);
  score = Math.max(10, Math.min(100, score));

  let status: 'Healthy' | 'Needs Attention' | 'High Pending' = 'Healthy';
  let explanation = '';

  if (score >= 85) {
    status = 'Healthy';
    explanation = `${balances.filter((b) => b.netBalance === 0).length} members balanced. Fast turnaround with minimal outstanding balance.`;
  } else if (score >= 60) {
    status = 'Needs Attention';
    explanation = `${unresolvedCount} members have unsettled balances pending for ~${oldestPendingDays} days.`;
  } else {
    status = 'High Pending';
    explanation = `High outstanding debt volume relative to group spending. Prompt settlements recommended.`;
  }

  return {
    score,
    status,
    explanation,
    settledRatio: totalVolume > 0 ? settledVolume / totalVolume : 1,
    unresolvedCount,
    oldestPendingDays,
  };
}

/**
 * Unique Feature #3: SplitSense Assistant
 * Deterministic business logic analyzing split patterns, fairness, and outcomes.
 */
export function generateSplitSense(
  title: string,
  totalMinor: number,
  payer: User,
  participants: { user: User; shareAmount: number; percentage?: number }[],
  splitMethod: SplitMethod,
  currency: CurrencyCode = 'INR'
): SplitSenseAnalysis {
  const formattedTotal = formatCurrency(totalMinor, currency);
  const count = participants.length;

  if (count <= 1) {
    return {
      type: 'SINGLE_COVERAGE',
      headline: 'Personal or Single Member Expense',
      details: [`${payer.name} paid ${formattedTotal} solely for themselves.`],
      suggestedAction: 'No split transfers required.',
    };
  }

  const payerInParticipants = participants.find((p) => p.user.id === payer.id);
  const payerOwnShare = payerInParticipants ? payerInParticipants.shareAmount : 0;
  const netPayerCredit = totalMinor - payerOwnShare;

  if (splitMethod === 'EQUAL') {
    const perPerson = formatCurrency(Math.floor(totalMinor / count), currency);
    return {
      type: 'EQUAL',
      headline: `Equal split detected across ${count} people`,
      details: [
        `Each member owes ${perPerson}.`,
        `${payer.name} paid the full ${formattedTotal} upfront.`,
        `${payer.name} should receive a total of ${formatCurrency(netPayerCredit, currency)} from the other ${count - 1} members.`,
      ],
      suggestedAction: `Everyone sends ${perPerson} to ${payer.name} or simplifies at sphere settlement.`,
    };
  }

  if (splitMethod === 'PERCENTAGE') {
    const highestShare = [...participants].sort((a, b) => b.shareAmount - a.shareAmount)[0];
    return {
      type: 'CUSTOM',
      headline: `Proportional percentage split`,
      details: [
        `Percentages total 100% across ${count} members.`,
        `${highestShare.user.name} has the largest allocation at ${highestShare.percentage}% (${formatCurrency(highestShare.shareAmount, currency)}).`,
        `${payer.name} receives ${formatCurrency(netPayerCredit, currency)} in net reimbursement.`,
      ],
      suggestedAction: 'Balances adjusted automatically according to configured shares.',
    };
  }

  // Exact or uneven
  return {
    type: 'UNEVEN',
    headline: `Custom allocation for ${title}`,
    details: [
      `Individual customized shares verified against total of ${formattedTotal}.`,
      `${payer.name} covered the initial bill.`,
      `Outstanding share distributions will be logged to member ledgers.`,
    ],
    suggestedAction: 'Transactions are recorded directly into the sphere financial orbit.',
  };
}
