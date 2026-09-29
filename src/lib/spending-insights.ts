import { Expense, DeterministicInsight, Settlement, CurrencyCode } from '../types';
import { formatCurrency } from './currency';

export function generateSpendingInsights(
  expenses: Expense[],
  settlements: Settlement[],
  currency: CurrencyCode = 'INR'
): DeterministicInsight[] {
  if (expenses.length === 0) {
    return [
      {
        id: 'no-expenses',
        type: 'spending',
        title: 'Fresh Financial Orbit',
        description: 'No shared expenses recorded yet. Create an expense to unlock real-time spending insights.',
      },
    ];
  }

  const insights: DeterministicInsight[] = [];
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 1. Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0) {
    const [topCat, topAmount] = sortedCategories[0];
    const percentage = Math.round((topAmount / totalSpend) * 100);
    insights.push({
      id: 'top-category',
      type: 'category',
      title: `${topCat} is your largest shared expense`,
      description: `Accounting for ${percentage}% (${formatCurrency(topAmount, currency)}) of overall group expenses.`,
      metric: `${percentage}%`,
    });
  }

  // 2. Average expense size and largest expense
  const avgExpense = Math.round(totalSpend / expenses.length);
  const sortedByAmount = [...expenses].sort((a, b) => b.amount - a.amount);
  const largest = sortedByAmount[0];

  insights.push({
    id: 'average-size',
    type: 'spending',
    title: 'Average Transaction Velocity',
    description: `Across ${expenses.length} group expenses, your mean transaction size is ${formatCurrency(avgExpense, currency)}. Largest single expense was "${largest.title}" at ${formatCurrency(largest.amount, currency)}.`,
    metric: formatCurrency(avgExpense, currency),
  });

  // 3. Settlement completion ratio
  const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
  if (totalSettled > 0) {
    const settleRatio = Math.min(100, Math.round((totalSettled / totalSpend) * 100));
    insights.push({
      id: 'settlement-progress',
      type: 'settlement',
      title: 'Settlement Resolution Velocity',
      description: `${formatCurrency(totalSettled, currency)} has been settled through ${settlements.length} verified transfers (${settleRatio}% of active obligations cleared).`,
      metric: `${settleRatio}% cleared`,
    });
  } else {
    insights.push({
      id: 'settlement-pending',
      type: 'settlement',
      title: 'Pending Settlement Pool',
      description: 'Zero manual settlements recorded yet. Use One-Tap Simplify & Settle to balance debts with minimal transactions.',
      metric: `${expenses.length} active`,
    });
  }

  // 4. Primary front-runner / frequent payer
  const payerCounts: Record<string, { count: number; total: number; name: string }> = {};
  expenses.forEach((e) => {
    const id = e.paidById;
    if (!payerCounts[id]) {
      payerCounts[id] = { count: 0, total: 0, name: e.paidBy?.name || 'Member' };
    }
    payerCounts[id].count += 1;
    payerCounts[id].total += e.amount;
  });

  const topPayer = Object.values(payerCounts).sort((a, b) => b.total - a.total)[0];
  if (topPayer) {
    const payerShare = Math.round((topPayer.total / totalSpend) * 100);
    insights.push({
      id: 'top-payer',
      type: 'comparison',
      title: `${topPayer.name} leads initial payments`,
      description: `Covered ${topPayer.count} bills totalling ${formatCurrency(topPayer.total, currency)} (${payerShare}% of all group outlays).`,
      metric: `${topPayer.count} bills`,
    });
  }

  return insights;
}
