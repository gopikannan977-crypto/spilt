import React, { useState } from 'react';
import { formatCurrency } from '../../lib/currency';
import {
  Search,
  Download,
  Receipt,
  CheckCircle2,
  Calendar,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'EXPENSE' | 'SETTLEMENT';
  title: string;
  amount: number;
  currency: any;
  date: string;
  category: string;
  sphereId: string;
  sphereName: string;
  actor: string;
  actorId: string;
  isUserActor: boolean;
  description?: string;
}

interface ActivityViewProps {
  activity: ActivityItem[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ activity }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'SETTLEMENT'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');

  // Filter & Search
  let processed = activity.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.actor.toLowerCase().includes(q) ||
      item.sphereName.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q));

    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort
  processed.sort((a, b) => {
    if (sortBy === 'NEWEST') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'OLDEST') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'HIGHEST') return b.amount - a.amount;
    if (sortBy === 'LOWEST') return a.amount - b.amount;
    return 0;
  });

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Title', 'Amount', 'Currency', 'Category', 'Sphere', 'Actor', 'Date', 'Description'];
    const rows = processed.map((item) => [
      item.id,
      item.type,
      `"${item.title.replace(/"/g, '""')}"`,
      (item.amount / 100).toFixed(2),
      item.currency,
      item.category,
      `"${item.sphereName.replace(/"/g, '""')}"`,
      `"${item.actor.replace(/"/g, '""')}"`,
      new Date(item.date).toISOString().split('T')[0],
      `"${(item.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SplitSphere_Activity_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = ['ALL', 'Food', 'Travel', 'Entertainment', 'Bills', 'Rent', 'Settlement'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Activity Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Auditable transaction history of all expenses and mutual settlements
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="orbit-surface p-4 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses, members, spheres, notes..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Types (Expenses & Settlements)</option>
              <option value="EXPENSE">Expenses Only</option>
              <option value="SETTLEMENT">Settlements Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="HIGHEST">Highest Amount</option>
              <option value="LOWEST">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
            Category:
          </span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterCategory === c
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table / Cards */}
      <div className="orbit-surface bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {processed.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No transactions match the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {processed.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      item.type === 'SETTLEMENT'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600'
                    }`}
                  >
                    {item.type === 'SETTLEMENT' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Receipt className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                      {item.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.sphereName}
                      </span>
                      <span>·</span>
                      <span>Logged by {item.actor}</span>
                      <span>·</span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      {item.description && (
                        <>
                          <span>·</span>
                          <span className="italic truncate max-w-xs">{item.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end gap-1.5 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-bold font-mono-tabular inline-block ${
                      item.type === 'SETTLEMENT'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    {formatCurrency(item.amount, item.currency)}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
