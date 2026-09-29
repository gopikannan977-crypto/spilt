import React, { useState } from 'react';
import { MoneySphere, SphereCategory } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { Plus, Search, Compass, Users, Sparkles, ArrowRight } from 'lucide-react';

interface SpheresViewProps {
  spheres: MoneySphere[];
  onSelectSphere: (id: string) => void;
  onOpenCreateSphere: () => void;
}

export const SpheresView: React.FC<SpheresViewProps> = ({
  spheres,
  onSelectSphere,
  onOpenCreateSphere,
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = spheres.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || s.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', 'TRAVEL', 'APARTMENT', 'OFFICE', 'FRIENDS', 'FAMILY', 'EVENT'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Money Spheres
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Independent financial orbits for each of your trips, housemates, and teams
          </p>
        </div>

        <button
          onClick={onOpenCreateSphere}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Sphere</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spheres..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors capitalize ${
                filterCategory === cat
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Spheres */}
      {filtered.length === 0 ? (
        <div className="orbit-surface p-12 text-center bg-white dark:bg-slate-900 space-y-3">
          <Compass className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Money Spheres match your criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search or launch a new shared financial sphere.
          </p>
          <button
            onClick={onOpenCreateSphere}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Create Sphere
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectSphere(s.id)}
              className="orbit-surface bg-white dark:bg-slate-900 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              {/* Cover Gradient Banner */}
              <div className={`h-24 bg-gradient-to-r ${s.coverGradient} p-4 flex items-start justify-between text-white relative`}>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/25 backdrop-blur-xs">
                  {s.category}
                </span>
                <span className="text-xs font-mono-tabular font-bold bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {s.currency}
                </span>
              </div>

              {/* Sphere Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {s.description || 'Shared money sphere'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{s.members.length} members</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                      Total Spent
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold font-mono-tabular text-slate-900 dark:text-white inline-block">
                      {formatCurrency(s.totalSpent || 0, s.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
