import React, { useState } from 'react';
import {
  CurrencyCode,
  Expense,
  MoneySphere,
  Settlement,
  SphereBalancesResponse,
  User,
} from '../../types';
import { formatCurrency, formatNetBalance } from '../../lib/currency';
import { FinancialOrbit } from '../orbit/FinancialOrbit';
import {
  ArrowLeft,
  Plus,
  Zap,
  ShieldCheck,
  Receipt,
  Users,
  Wallet,
  Calendar,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  FileText,
  X,
  CreditCard,
} from 'lucide-react';

interface SphereDetailViewProps {
  sphere: MoneySphere;
  currentUser: User;
  expenses: Expense[];
  settlements: Settlement[];
  balances: SphereBalancesResponse | null;
  onBack: () => void;
  onOpenAddExpense: () => void;
  onOpenSettlement: (fromUser: User, toUser: User, amount: number) => void;
  onOpenPaymentRequest: (toUser?: User, amountMinor?: number) => void;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onAddMember: (email: string, name?: string) => Promise<void>;
}

export const SphereDetailView: React.FC<SphereDetailViewProps> = ({
  sphere,
  currentUser,
  expenses,
  settlements,
  balances,
  onBack,
  onOpenAddExpense,
  onOpenSettlement,
  onOpenPaymentRequest,
  onDeleteExpense,
  onAddMember,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'expenses' | 'balances' | 'settlement' | 'members'
  >('overview');

  const [showHealthModal, setShowHealthModal] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<{ url: string; name: string } | null>(null);

  // New member form
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  const totalSpent = balances?.totalSpent || 0;
  const pendingAmount = balances?.pendingSettlementsAmount || 0;
  const settledAmount = balances?.settledAmount || 0;
  const health = balances?.healthScore || {
    score: 100,
    status: 'Healthy' as const,
    explanation: 'No pending debts.',
    settledRatio: 1,
    unresolvedCount: 0,
    oldestPendingDays: 0,
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberEmail.includes('@')) {
      setMemberError('Valid email address required');
      return;
    }
    setIsAddingMember(true);
    setMemberError(null);
    try {
      await onAddMember(newMemberEmail, newMemberName);
      setNewMemberEmail('');
      setNewMemberName('');
    } catch (err: any) {
      setMemberError(err.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Spheres</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Sphere Header Card */}
      <div className="orbit-surface bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {/* Cover Ribbon */}
        <div className={`h-28 bg-gradient-to-r ${sphere.coverGradient} p-6 flex flex-col justify-between text-white relative`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-xs">
              {sphere.category}
            </span>
            <span className="text-xs font-mono-tabular font-bold bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
              {sphere.currency}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight drop-shadow-xs">
              {sphere.name}
            </h1>
            <p className="text-xs text-white/80 drop-shadow-xs line-clamp-1 mt-0.5">
              {sphere.description || 'Shared money sphere'}
            </p>
          </div>
        </div>

        {/* Sphere Balances & Unique Feature #5 Settlement Health */}
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 shadow-2xs overflow-hidden flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Total Sphere Spend
            </span>
            <span
              className="text-base sm:text-lg font-black font-mono-tabular text-slate-900 dark:text-white block truncate mt-1"
              title={formatCurrency(totalSpent, sphere.currency)}
            >
              {formatCurrency(totalSpent, sphere.currency)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-950/60 shadow-2xs overflow-hidden flex flex-col justify-between">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold tracking-wider block">
              Pending Settlements
            </span>
            <span
              className="text-base sm:text-lg font-black font-mono-tabular text-amber-600 dark:text-amber-400 block truncate mt-1"
              title={formatCurrency(pendingAmount, sphere.currency)}
            >
              {formatCurrency(pendingAmount, sphere.currency)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-950/60 shadow-2xs overflow-hidden flex flex-col justify-between">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider block">
              Settled Volume
            </span>
            <span
              className="text-base sm:text-lg font-black font-mono-tabular text-emerald-600 dark:text-emerald-400 block truncate mt-1"
              title={formatCurrency(settledAmount, sphere.currency)}
            >
              {formatCurrency(settledAmount, sphere.currency)}
            </span>
          </div>

          {/* UNIQUE FEATURE #5: SETTLEMENT SCORE BADGE */}
          <div
            onClick={() => setShowHealthModal(true)}
            className="cursor-pointer group p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-2xs overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              <span>Settlement Health</span>
              <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-lg sm:text-xl font-black font-mono-tabular ${
                  health.score >= 85
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : health.score >= 60
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {health.score}/100
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  health.score >= 85
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : health.score >= 60
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {health.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'expenses', label: `Expenses (${expenses.length})` },
            { id: 'balances', label: 'Balances' },
            { id: 'settlement', label: `Settlements (${settlements.length})` },
            { id: 'members', label: `Members (${sphere.members.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* UNIQUE FEATURE #4: ONE-TAP SETTLEMENT CARD (SIMPLIFY & SETTLE) */}
      {balances && balances.optimizedSettlements.length > 0 && (
        <div className="orbit-surface p-5 bg-gradient-to-r from-indigo-50/80 via-white to-emerald-50/80 dark:from-indigo-950/40 dark:via-slate-900 dark:to-emerald-950/40 border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                One-Tap Settlement Optimization
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Greedy min-cash-flow algorithm reduced mutual debts down to{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {balances.optimizedSettlements.length} direct transfers
              </strong>{' '}
              instead of multiple circular payments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {balances.optimizedSettlements.map((tx, idx) => (
              <button
                key={idx}
                onClick={() => onOpenSettlement(tx.fromUser, tx.toUser, tx.amount)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>
                  {tx.fromUser.name.split(' ')[0]} → {tx.toUser.name.split(' ')[0]}
                </span>
                <span className="font-mono-tabular font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(tx.amount, tx.currency)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {balances && (
            <FinancialOrbit
              balances={balances.memberBalances}
              transactions={balances.optimizedSettlements}
              onSettleClick={(from, to, amt) => onOpenSettlement(from, to, amt)}
              onRequestClick={() => onOpenPaymentRequest()}
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="orbit-surface bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recorded Bills & Expenses
            </h3>
            <button
              onClick={onOpenAddExpense}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No expenses recorded in this sphere yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((e) => (
                <div key={e.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {e.title}
                        </span>
                        {e.receiptUrl && (
                          <button
                            onClick={() =>
                              setPreviewReceipt({ url: e.receiptUrl!, name: e.receiptName || 'Receipt' })
                            }
                            className="p-1 rounded text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
                            title="View Receipt"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>Paid by {e.paidBy?.name}</span>
                        <span>·</span>
                        <span>{new Date(e.date).toLocaleDateString()}</span>
                        <span>·</span>
                        <span className="capitalize">{e.category}</span>
                        <span>·</span>
                        <span>{e.splitMethod.toLowerCase()} split</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm font-bold font-mono-tabular text-slate-900 dark:text-white inline-block">
                        {formatCurrency(e.amount, e.currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {e.participants.length} shares
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteExpense(e.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: BALANCES */}
      {activeTab === 'balances' && balances && (
        <div className="orbit-surface bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Individual Member Balances
          </h3>

          <div className="space-y-3">
            {balances.memberBalances.map((mb) => {
              const { text, isPositive, isZero } = formatNetBalance(mb.netBalance, sphere.currency);
              return (
                <div
                  key={mb.userId}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold flex items-center justify-center text-xs">
                      {mb.user.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                        {mb.user.name} {mb.userId === currentUser.id ? '(You)' : ''}
                      </span>
                      <span className="text-xs text-slate-500">
                        Paid: {formatCurrency(mb.totalPaid, sphere.currency)} · Owed:{' '}
                        {formatCurrency(mb.totalOwed, sphere.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-bold font-mono-tabular shrink-0 ${
                        isZero
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                          : isPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isZero ? 'Settled Up' : text}
                    </span>

                    {mb.userId !== currentUser.id && (
                      <button
                        onClick={() => onOpenPaymentRequest(mb.user, Math.abs(mb.netBalance))}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-indigo-400"
                      >
                        Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTLEMENTS */}
      {activeTab === 'settlement' && (
        <div className="orbit-surface bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Settlement Ledger
            </h3>
            {sphere.members.length > 1 && (
              <button
                onClick={() =>
                  onOpenSettlement(sphere.members[0].user, sphere.members[1].user, 10000)
                }
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Settlement</span>
              </button>
            )}
          </div>

          {settlements.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No manual settlements recorded yet in this sphere.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {settlements.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        {s.fromUser?.name} paid {s.toUser?.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Method: {s.method} · Ref: {s.referenceId} ·{' '}
                        {new Date(s.settledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-bold font-mono-tabular text-emerald-700 dark:text-emerald-300 shrink-0">
                    {formatCurrency(s.amount, s.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MEMBERS */}
      {activeTab === 'members' && (
        <div className="orbit-surface bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Sphere Members ({sphere.members.length})
              </h3>
              <p className="text-xs text-slate-500">
                Collaborative participants connected in this financial orbit
              </p>
            </div>
          </div>

          {/* Add member form */}
          <form onSubmit={handleAddMemberSubmit} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Invite / Add Member
            </span>
            {memberError && (
              <p className="text-xs text-rose-600">{memberError}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="email"
                required
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="member@example.com"
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Name (Optional)"
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isAddingMember}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAddingMember ? 'Adding...' : 'Add Member'}</span>
              </button>
            </div>
          </form>

          {/* Member List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sphere.members.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold flex items-center justify-center text-xs">
                    {m.user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {m.user.name} {m.userId === currentUser.id ? '(You)' : ''}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{m.user.email}</span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTLEMENT HEALTH MODAL */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Settlement Health Metric
                </h3>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
              <span className="text-4xl font-black font-mono-tabular text-indigo-600 dark:text-indigo-400">
                {health.score}/100
              </span>
              <span className="block text-xs font-bold mt-1 text-slate-700 dark:text-slate-300">
                Status: {health.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                How this is calculated:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Settled Volume Ratio:</strong> Evaluates resolved obligations against overall spending.
                </li>
                <li>
                  <strong>Oldest Pending Debt:</strong> Currently ~{health.oldestPendingDays} days. Debts aged &gt;14 days decrease health velocity.
                </li>
                <li>
                  <strong>Unresolved Members:</strong> {health.unresolvedCount} members currently carry negative balances.
                </li>
              </ul>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 mt-3 text-[11px]">
                {health.explanation}
              </div>
            </div>

            <button
              onClick={() => setShowHealthModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {previewReceipt.name}
              </span>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-2">
              {previewReceipt.url.startsWith('data:image') ? (
                <img
                  src={previewReceipt.url}
                  alt={previewReceipt.name}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
                  <span>PDF Document attached: {previewReceipt.name}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <button
                onClick={() => setPreviewReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
