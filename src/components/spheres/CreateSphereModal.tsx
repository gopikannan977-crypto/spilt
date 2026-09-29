import React, { useState } from 'react';
import { CurrencyCode, SphereCategory, User } from '../../types';
import { X, Plus, Trash2, Globe, Sparkles } from 'lucide-react';

interface CreateSphereModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allKnownUsers: User[];
  onSphereCreated: (data: any) => Promise<void>;
}

const SPHERE_CATEGORIES: { key: SphereCategory; label: string }[] = [
  { key: 'TRAVEL', label: 'Travel & Trips' },
  { key: 'FRIENDS', label: 'Friends & Hangouts' },
  { key: 'APARTMENT', label: 'Apartment & Living' },
  { key: 'OFFICE', label: 'Office & Work Team' },
  { key: 'FAMILY', label: 'Family & Home' },
  { key: 'EVENT', label: 'Event & Party' },
  { key: 'PROJECT', label: 'Project & Venture' },
  { key: 'OTHER', label: 'Other' },
];

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'AED' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
];

export const CreateSphereModal: React.FC<CreateSphereModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allKnownUsers,
  onSphereCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SphereCategory>('TRAVEL');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Selected members
  const otherUsers = allKnownUsers.filter((u) => u.id !== currentUser.id);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    otherUsers.slice(0, 2).map((u) => u.id)
  );
  const [customEmail, setCustomEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCustomEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    // Check if matching known user
    const existing = allKnownUsers.find(
      (u) => u.email.toLowerCase() === customEmail.toLowerCase()
    );
    if (existing && !selectedUserIds.includes(existing.id)) {
      setSelectedUserIds([...selectedUserIds, existing.id]);
    }
    setCustomEmail('');
  };

  const handleToggleMember = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a Sphere name');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSphereCreated({
        name: name.trim(),
        description: description.trim(),
        category,
        currency,
        memberUserIds: selectedUserIds,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create Sphere');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create Money Sphere
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Establish a new financial orbit for your trip, team, or house
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Sphere Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Manali Expedition, Flat 3B, Summer Festival"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SphereCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SPHERE_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono-tabular focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} - {c.label} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this sphere is for..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Add Members */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Include Members
            </label>

            <div className="flex flex-wrap gap-2 mb-2">
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                <span>{currentUser.name} (You - Admin)</span>
              </div>

              {otherUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleToggleMember(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
                    }`}
                  >
                    + {u.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Launch Sphere'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
