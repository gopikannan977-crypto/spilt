import React, { useState } from 'react';
import { CurrencyCode, PaymentMethod, User } from '../../types';
import { formatCurrency, toMinorUnits, toMajorUnits } from '../../lib/currency';
import { X, CheckCircle, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  sphereId: string;
  currency: CurrencyCode;
  fromUser: User;
  toUser: User;
  suggestedAmountMinor: number;
  onSettlementRecorded: (settlementData: any) => Promise<void>;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  sphereId,
  currency,
  fromUser,
  toUser,
  suggestedAmountMinor,
  onSettlementRecorded,
}) => {
  const [amountStr, setAmountStr] = useState(
    suggestedAmountMinor > 0 ? (toMajorUnits(suggestedAmountMinor)).toString() : ''
  );
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [referenceId, setReferenceId] = useState(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAmountMinor = toMinorUnits(amountStr);
  const isPartial = currentAmountMinor < suggestedAmountMinor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmountMinor <= 0) {
      setErrorMsg('Please enter a positive settlement amount');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSettlementRecorded({
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        amount: currentAmountMinor,
        method,
        referenceId,
        notes,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record Settlement
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

          {/* Transfer visual header */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Payer</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {fromUser.name}
              </span>
            </div>

            <ArrowRight className="w-5 h-5 text-indigo-500" />

            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Recipient</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {toUser.name}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Settlement Amount ({currency})
            </label>
            <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden shadow-2xs">
              <span className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700/60 border-r border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3 py-2.5 bg-transparent text-slate-900 dark:text-white font-mono-tabular text-base font-bold focus:outline-none"
              />
            </div>
            {suggestedAmountMinor > 0 && isPartial && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                Partial settlement: Remaining balance will be{' '}
                {formatCurrency(suggestedAmountMinor - currentAmountMinor, currency)}.
              </p>
            )}
          </div>

          {/* Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank IMPS / NEFT / Wire</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Reference ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reference / Transaction ID
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. UPI Ref Number or Check ID"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono-tabular focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared resort share via UPI"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              SplitSphere logs verified peer-to-peer transfers. Real funds remain directly between your bank/UPI apps.
            </span>
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
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Recording...' : 'Mark as Settled'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
