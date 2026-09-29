import React, { useState } from 'react';
import { DeterministicInsight, MoneySphere } from '../../types';
import { formatCurrency } from '../../lib/currency';
import {
  PieChart,
  TrendingUp,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsViewProps {
  totalSpent: number;
  spheresCount: number;
  expensesCount: number;
  settlementsCount: number;
  insights: DeterministicInsight[];
  categoryDistribution: { category: string; amount: number }[];
  monthlySpending: { month: string; amount: number }[];
  spheres: MoneySphere[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  totalSpent,
  spheresCount,
  expensesCount,
  settlementsCount,
  insights,
  categoryDistribution,
  monthlySpending,
  spheres,
}) => {
  const [timeFilter, setTimeFilter] = useState<'7D' | '30D' | '3M' | '6M' | '1Y' | 'ALL'>('ALL');

  // Calculate clean integer rupee average to avoid fractional paise overflow in cards
  const averageExpense =
    expensesCount > 0 ? Math.round(totalSpent / (expensesCount * 100)) * 100 : 0;
  const sortedCategories = [...categoryDistribution].sort((a, b) => b.amount - a.amount);
  const maxCategorySpend = sortedCategories[0]?.amount || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Spending Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deterministic data calculations and financial velocity metrics
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          {(['7D', '30D', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timeFilter === tf
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards - Structured to guarantee amounts fit cleanly inside boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Cumulative Volume */}
        <div className="orbit-surface p-4 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between overflow-hidden">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
            Cumulative Shared Volume
          </span>
          <div className="my-1.5 overflow-hidden">
            <span
              className="text-base sm:text-lg lg:text-xl font-extrabold font-mono-tabular text-slate-900 dark:text-white tracking-tight block truncate"
              title={formatCurrency(totalSpent)}
            >
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Across {spheresCount} active spheres
          </span>
        </div>

        {/* Card 2: Average Bill Size */}
        <div className="orbit-surface p-4 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between overflow-hidden">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
            Average Bill Size
          </span>
          <div className="my-1.5 overflow-hidden">
            <span
              className="text-base sm:text-lg lg:text-xl font-extrabold font-mono-tabular text-indigo-600 dark:text-indigo-400 tracking-tight block truncate"
              title={formatCurrency(averageExpense)}
            >
              {formatCurrency(averageExpense)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Across {expensesCount} expenses
          </span>
        </div>

        {/* Card 3: Settlement Transfers */}
        <div className="orbit-surface p-4 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between overflow-hidden">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
            Settlement Transfers
          </span>
          <div className="my-1.5">
            <span className="text-base sm:text-lg lg:text-xl font-extrabold font-mono-tabular text-emerald-600 dark:text-emerald-400 tracking-tight block">
              {settlementsCount}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Verified peer settlements
          </span>
        </div>

        {/* Card 4: Top Category */}
        <div className="orbit-surface p-4 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between overflow-hidden">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
            Top Category
          </span>
          <div className="my-1.5 overflow-hidden">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white truncate">
                {sortedCategories[0]?.category || 'N/A'}
              </span>
              <span
                className="text-xs font-bold font-mono-tabular text-indigo-600 dark:text-indigo-400 truncate"
                title={sortedCategories[0] ? formatCurrency(sortedCategories[0].amount) : '₹0'}
              >
                {sortedCategories[0] ? formatCurrency(sortedCategories[0].amount) : '₹0'}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Highest volume outlay
          </span>
        </div>
      </div>

      {/* UNIQUE FEATURE #6: DETERMINISTIC SPENDING INSIGHTS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Deterministic Spending Insights
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="orbit-surface p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                  {insight.type}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {insight.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {insight.description}
                </p>
              </div>
              {insight.metric && (
                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                  <span className="text-xs font-mono-tabular font-bold text-slate-800 dark:text-slate-200">
                    {insight.metric}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Progress Bars */}
        <div className="lg:col-span-6 orbit-surface p-6 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Category Distribution
            </h3>
            <span className="text-xs text-slate-400">
              {categoryDistribution.length} categories
            </span>
          </div>

          <div className="space-y-3.5">
            {sortedCategories.map((cat) => {
              const pct = totalSpent > 0 ? Math.round((cat.amount / totalSpent) * 100) : 0;
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat.category}
                    </span>
                    <span className="font-mono-tabular font-bold text-slate-900 dark:text-white">
                      {formatCurrency(cat.amount)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend / Sphere Outlays */}
        <div className="lg:col-span-6 orbit-surface p-6 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Spending by Sphere
            </h3>
            <span className="text-xs text-slate-400">
              {spheres.length} spheres
            </span>
          </div>

          <div className="space-y-3">
            {spheres.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {s.category} · {s.members.length} members
                    </span>
                  </div>
                </div>

                <span className="text-sm font-bold font-mono-tabular text-slate-900 dark:text-white">
                  {formatCurrency(s.totalSpent || 0, s.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
