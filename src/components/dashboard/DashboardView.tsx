import React from 'react';
import {
  DeterministicInsight,
  MemberBalance,
  MoneySphere,
  SimplifiedTransaction,
  User,
} from '../../types';
import { formatCurrency, formatNetBalance } from '../../lib/currency';
import { FinancialOrbit } from '../orbit/FinancialOrbit';
import {
  PlusCircle,
  Compass,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowRight,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  netBalance: number;
  youAreOwed: number;
  youOwe: number;
  totalSpent: number;
  spheres: MoneySphere[];
  insights: DeterministicInsight[];
  recentActivity: any[];
  orbitBalances: MemberBalance[];
  orbitTransactions: SimplifiedTransaction[];
  onOpenAddExpense: () => void;
  onOpenCreateSphere: () => void;
  onOpenPaymentRequest: () => void;
  onSelectSphere: (sphereId: string) => void;
  onOpenSettlement: (fromUser: User, toUser: User, amount: number) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  netBalance,
  youAreOwed,
  youOwe,
  totalSpent,
  spheres,
  insights,
  recentActivity,
  orbitBalances,
  orbitTransactions,
  onOpenAddExpense,
  onOpenCreateSphere,
  onOpenPaymentRequest,
  onSelectSphere,
  onOpenSettlement,
  onNavigate,
}) => {
  // Determine greeting based on hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const { text: netText, isPositive, isZero } = formatNetBalance(netBalance);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* GREETING & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Every shared expense across {spheres.length} Money Spheres synchronized.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={onOpenPaymentRequest}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-indigo-500" />
            <span>Request Money</span>
          </button>

          <button
            onClick={onOpenCreateSphere}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-violet-500" />
            <span>New Sphere</span>
          </button>
        </div>
      </div>

      {/* MAIN FINANCIAL ORBIT BALANCE CARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Core Net Balance Card */}
        <div className="md:col-span-6 lg:col-span-5 orbit-surface p-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl">
          {/* Subtle orbital background pattern */}
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full border border-indigo-400/20 pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full border border-indigo-400/10 pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Your Net Balance
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white backdrop-blur-xs">
              All Spheres
            </span>
          </div>

          <div className="my-2 max-w-full">
            <div className="px-4 py-2 rounded-2xl bg-white/10 dark:bg-black/40 border border-white/15 backdrop-blur-md inline-flex items-center max-w-full overflow-hidden shadow-inner">
              <span
                className={`text-2xl sm:text-3xl lg:text-4xl font-black font-mono-tabular tracking-tight block truncate ${
                  isZero
                    ? 'text-emerald-400'
                    : isPositive
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
                title={netText}
              >
                {netText}
              </span>
            </div>
          </div>

          <p className="text-xs text-indigo-200/80 mb-5 truncate">
            {isZero
              ? "You're completely settled up across all active groups."
              : isPositive
              ? `You are owed ${formatCurrency(youAreOwed)} in total net reimbursements.`
              : `You owe ${formatCurrency(youOwe)} across group expenses.`}
          </p>

          {/* Sub-metrics */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <span className="text-[10px] text-indigo-300 block uppercase font-bold tracking-wider">
                You are owed
              </span>
              <span className="text-sm sm:text-base font-bold font-mono-tabular text-emerald-400 block truncate mt-0.5" title={formatCurrency(youAreOwed)}>
                {formatCurrency(youAreOwed)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <span className="text-[10px] text-indigo-300 block uppercase font-bold tracking-wider">
                You owe
              </span>
              <span className="text-sm sm:text-base font-bold font-mono-tabular text-rose-400 block truncate mt-0.5" title={formatCurrency(youOwe)}>
                {formatCurrency(youOwe)}
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="orbit-surface p-5 bg-white dark:bg-slate-900 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold truncate">Total Shared Spending</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 overflow-hidden">
              <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 inline-block max-w-full">
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono-tabular block truncate" title={formatCurrency(totalSpent)}>
                  {formatCurrency(totalSpent)}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1.5 truncate">
                Across {spheres.length} active Money Spheres
              </span>
            </div>
          </div>

          <div className="orbit-surface p-5 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Active Spheres</span>
              <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-tabular">
                {spheres.length}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Travel, Apartment, Office & Friends
              </span>
            </div>
          </div>

          {/* Quick Shortcuts to Spheres */}
          <div className="col-span-2 orbit-surface p-4 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  One-Tap Settlement Available
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {orbitTransactions.length} simplified transfer paths detected
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('spheres')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Spheres</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* UNIQUE FEATURE #1: FINANCIAL ORBIT LIVE NETWORK */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Primary Financial Orbit
            </h2>
            <p className="text-xs text-slate-500">
              Live money connections between you and your circle
            </p>
          </div>
          {spheres[0] && (
            <button
              onClick={() => onSelectSphere(spheres[0].id)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Focus on {spheres[0].name} →
            </button>
          )}
        </div>

        <FinancialOrbit
          balances={orbitBalances}
          transactions={orbitTransactions}
          onSettleClick={(from, to, amt) => onOpenSettlement(from, to, amt)}
          onRequestClick={() => onOpenPaymentRequest()}
        />
      </div>

      {/* UNIQUE FEATURE #6: DETERMINISTIC SPENDING INSIGHTS */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Spending Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="orbit-surface p-4 bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                    {insight.type}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
                {insight.metric && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                    <span className="text-xs font-mono-tabular font-bold text-slate-800 dark:text-slate-200">
                      {insight.metric}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY TIMELINE & YOUR SPHERES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Your Spheres */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Your Money Spheres
            </h3>
            <button
              onClick={() => onNavigate('spheres')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {spheres.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSphere(s.id)}
                className="orbit-surface p-4 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group shadow-xs"
              >
                <div className={`h-2 rounded-full bg-gradient-to-r ${s.coverGradient} mb-3`} />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {s.name}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {s.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                  {s.description || 'Shared money space'}
                </p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-400">
                  <span>{s.members.length} members</span>
                  <span className="font-mono-tabular font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(s.totalSpent || 0, s.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <button
              onClick={() => onNavigate('activity')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Ledger
            </button>
          </div>

          <div className="orbit-surface p-4 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activity</p>
            ) : (
              recentActivity.slice(0, 5).map((act, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        act.type === 'SETTLEMENT'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600'
                      }`}
                    >
                      {act.type === 'SETTLEMENT' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Receipt className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {act.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {act.actor} · {new Date(act.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono-tabular font-bold text-slate-900 dark:text-white shrink-0">
                    {formatCurrency(act.amount, act.currency)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
