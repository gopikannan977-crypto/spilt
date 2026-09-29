import React, { useState } from 'react';
import { CurrencyCode, MoneySphere, User } from '../../types';
import { toMinorUnits, toMajorUnits } from '../../lib/currency';
import { X, Send, Bell } from 'lucide-react';

interface PaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  spheres: MoneySphere[];
  currentUser: User;
  initialSphereId?: string;
  initialToUserId?: string;
  initialAmountMinor?: number;
  onRequestSent: (data: any) => Promise<void>;
}

export const PaymentRequestModal: React.FC<PaymentRequestModalProps> = ({
  isOpen,
  onClose,
  spheres,
  currentUser,
  initialSphereId,
  initialToUserId,
  initialAmountMinor,
  onRequestSent,
}) => {
  const [selectedSphereId, setSelectedSphereId] = useState(
    initialSphereId || (spheres[0]?.id || '')
  );

  const selectedSphere = spheres.find((s) => s.id === selectedSphereId) || spheres[0];
  const eligibleMembers = selectedSphere?.members.map((m) => m.user).filter((u) => u.id !== currentUser.id) || [];

  const [toUserId, setToUserId] = useState(initialToUserId || eligibleMembers[0]?.id || '');
  const [amountStr, setAmountStr] = useState(
    initialAmountMinor ? (toMajorUnits(initialAmountMinor)).toString() : ''
  );
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAmountMinor = toMinorUnits(amountStr);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSphereId || !toUserId || currentAmountMinor <= 0) {
      setErrorMsg('Please select a recipient, sphere, and valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onRequestSent({
        sphereId: selectedSphereId,
        toUserId,
        amount: currentAmountMinor,
        currency: selectedSphere?.currency || 'INR',
        note,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send payment request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Request Money
            </h3>
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

          {/* Select Sphere */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Sphere
            </label>
            <select
              value={selectedSphereId}
              onChange={(e) => {
                setSelectedSphereId(e.target.value);
                const sp = spheres.find((s) => s.id === e.target.value);
                const mems = sp?.members.map((m) => m.user).filter((u) => u.id !== currentUser.id);
                if (mems && mems.length > 0) {
                  setToUserId(mems[0].id);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {spheres.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Select Recipient */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Request From Member
            </label>
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {eligibleMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount ({selectedSphere?.currency || 'INR'})
            </label>
            <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden shadow-2xs">
              <span className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700/60 border-r border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                {selectedSphere?.currency || 'INR'}
              </span>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-transparent text-slate-900 dark:text-white font-mono-tabular text-base font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason / Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. For dinner bill share / airport taxi"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || currentAmountMinor <= 0}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
