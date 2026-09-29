import {
  calculateEqualSplit,
  calculatePercentageSplit,
  calculateSharesSplit,
  computeSphereBalances,
  simplifyDebts,
  calculateSettlementHealth,
  generateSplitSense,
} from '../src/lib/settlement-engine';
import { User, Expense, Settlement } from '../src/types';

/**
 * SplitSphere Comprehensive Mathematical and Algorithmic Test Suite
 */
function runTests() {
  console.log('🧪 Starting SplitSphere Algorithmic Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Equal Split & Remainder Precision
  {
    console.log('1. Testing Equal Split Remainder Preservation:');
    // ₹100.00 (10000 minor) divided among 3 people -> 3334, 3333, 3333
    const splits = calculateEqualSplit(10000, ['u1', 'u2', 'u3']);
    const totalAllocated = splits.reduce((sum, s) => sum + s.shareAmount, 0);

    assert(splits.length === 3, 'Returns 3 participant allocations');
    assert(splits[0].shareAmount === 3334, 'First participant absorbs remainder: 3334');
    assert(splits[1].shareAmount === 3333, 'Second participant share: 3333');
    assert(splits[2].shareAmount === 3333, 'Third participant share: 3333');
    assert(totalAllocated === 10000, 'Sum of shares EXACTLY equals total amount: 10000');
  }

  // 2. Percentage Split
  {
    console.log('\n2. Testing Percentage Split Precision:');
    // ₹2,400.00 (240000 minor) split 40%, 30%, 20%, 10%
    const pctSplits = calculatePercentageSplit(240000, [
      { userId: 'u1', percentage: 40 },
      { userId: 'u2', percentage: 30 },
      { userId: 'u3', percentage: 20 },
      { userId: 'u4', percentage: 10 },
    ]);
    const total = pctSplits.reduce((sum, s) => sum + s.shareAmount, 0);

    assert(pctSplits[0].shareAmount === 96000, '40% of 240000 is 96000');
    assert(pctSplits[1].shareAmount === 72000, '30% of 240000 is 72000');
    assert(pctSplits[2].shareAmount === 48000, '20% of 240000 is 48000');
    assert(pctSplits[3].shareAmount === 24000, '10% of 240000 is 24000');
    assert(total === 240000, 'Sum of percentage splits equals total 240000 exactly');
  }

  // 3. Shares Split
  {
    console.log('\n3. Testing Shares Proportion Split:');
    // Total ₹1,500.00 (150000 minor) with 2 shares, 2 shares, 1 share (total 5 shares)
    const sharesSplits = calculateSharesSplit(150000, [
      { userId: 'u1', shares: 2 },
      { userId: 'u2', shares: 2 },
      { userId: 'u3', shares: 1 },
    ]);
    const total = sharesSplits.reduce((sum, s) => sum + s.shareAmount, 0);

    assert(sharesSplits[0].shareAmount === 60000, '2/5 of 150000 is 60000');
    assert(sharesSplits[1].shareAmount === 60000, '2/5 of 150000 is 60000');
    assert(sharesSplits[2].shareAmount === 30000, '1/5 of 150000 is 30000');
    assert(total === 150000, 'Sum of shares equals total 150000 exactly');
  }

  // 4. Greedy Min-Cash-Flow Debt Simplification Algorithm
  {
    console.log('\n4. Testing One-Tap Greedy Min-Cash-Flow Simplification:');
    // Suppose net balances are:
    // A: +₹500 (50000)
    // B: +₹300 (30000)
    // C: -₹400 (-40000)
    // D: -₹400 (-40000)
    // Standard naive settling requires 4 to 6 transfers.
    // Optimal greedy simplifies into exactly 3 payments:
    // C -> A: ₹400
    // D -> A: ₹100
    // D -> B: ₹300
    const mockUsers: Record<string, User> = {
      A: { id: 'A', name: 'Alice', email: 'a@example.com', role: 'USER', createdAt: '' },
      B: { id: 'B', name: 'Bob', email: 'b@example.com', role: 'USER', createdAt: '' },
      C: { id: 'C', name: 'Charlie', email: 'c@example.com', role: 'USER', createdAt: '' },
      D: { id: 'D', name: 'David', email: 'd@example.com', role: 'USER', createdAt: '' },
    };

    const balances = [
      { userId: 'A', user: mockUsers.A, netBalance: 50000, totalPaid: 50000, totalOwed: 0 },
      { userId: 'B', user: mockUsers.B, netBalance: 30000, totalPaid: 30000, totalOwed: 0 },
      { userId: 'C', user: mockUsers.C, netBalance: -40000, totalPaid: 0, totalOwed: 40000 },
      { userId: 'D', user: mockUsers.D, netBalance: -40000, totalPaid: 0, totalOwed: 40000 },
    ];

    const simplified = simplifyDebts(balances, 'INR');

    assert(simplified.length === 3, `Optimized from N transfers down to exactly 3 transfers (actual: ${simplified.length})`);

    const totalTransferred = simplified.reduce((sum, t) => sum + t.amount, 0);
    assert(totalTransferred === 80000, 'Total transferred equals total net debt volume: 80000');
  }

  // 5. Balance Calculation Engine with Settlements
  {
    console.log('\n5. Testing Balance Engine with Partial Settlements:');
    const uGopi: User = { id: 'gopi', name: 'Gopi', email: 'gopi@example.com', role: 'ADMIN', createdAt: '' };
    const uSaro: User = { id: 'saro', name: 'Saro', email: 'saro@example.com', role: 'USER', createdAt: '' };

    // Gopi pays ₹2,000 (200000) for Dinner, split equally with Saro (₹1,000 each)
    const expense: Expense = {
      id: 'e1',
      sphereId: 's1',
      title: 'Dinner',
      amount: 200000,
      currency: 'INR',
      paidById: 'gopi',
      paidBy: uGopi,
      date: new Date().toISOString(),
      category: 'Food',
      splitMethod: 'EQUAL',
      participants: [
        { id: 'ep1', expenseId: 'e1', userId: 'gopi', shareAmount: 100000 },
        { id: 'ep2', expenseId: 'e1', userId: 'saro', shareAmount: 100000 },
      ],
      createdAt: '',
      updatedAt: '',
    };

    // Saro partially settles ₹400 (40000)
    const settlement: Settlement = {
      id: 's1',
      sphereId: 's1',
      fromUserId: 'saro',
      toUserId: 'gopi',
      amount: 40000,
      currency: 'INR',
      method: 'UPI',
      settledAt: new Date().toISOString(),
    };

    const res = computeSphereBalances(
      [{ user: uGopi }, { user: uSaro }],
      [expense],
      [settlement],
      'INR'
    );

    const gopiBal = res.memberBalances.find((b) => b.userId === 'gopi');
    const saroBal = res.memberBalances.find((b) => b.userId === 'saro');

    assert(gopiBal?.netBalance === 60000, 'Gopi net balance after partial settlement is +₹600 (+60000)');
    assert(saroBal?.netBalance === -60000, 'Saro net balance after partial settlement is -₹600 (-60000)');
    assert(res.pendingSettlementsAmount === 60000, 'Pending settlements volume is ₹600');
    assert(res.settledAmount === 40000, 'Settled volume is ₹400');
  }

  // 6. SplitSense Deterministic Assistant
  {
    console.log('\n6. Testing SplitSense Explanation Generator:');
    const uPayer: User = { id: 'p1', name: 'Saro', email: 'saro@example.com', role: 'USER', createdAt: '' };
    const analysis = generateSplitSense(
      'Seafood Dinner',
      240000,
      uPayer,
      [
        { user: uPayer, shareAmount: 60000 },
        { user: { id: 'p2', name: 'Gopi', email: 'g@ex.com', role: 'USER', createdAt: '' }, shareAmount: 60000 },
        { user: { id: 'p3', name: 'Priya', email: 'p@ex.com', role: 'USER', createdAt: '' }, shareAmount: 60000 },
        { user: { id: 'p4', name: 'Karthik', email: 'k@ex.com', role: 'USER', createdAt: '' }, shareAmount: 60000 },
      ],
      'EQUAL',
      'INR'
    );

    assert(analysis.type === 'EQUAL', 'Classified correctly as EQUAL');
    assert(analysis.headline.includes('4 people'), 'Mentions 4 participants in headline');
    assert(analysis.details.some((d) => d.includes('Saro paid the full ₹2,400')), 'Notes full payment by Saro');
  }

  console.log(`\n========================================`);
  console.log(`Test Execution Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
