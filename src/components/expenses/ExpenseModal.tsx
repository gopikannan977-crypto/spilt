import React, { useState, useEffect, useMemo } from 'react';
import {
  CurrencyCode,
  ExpenseCategory,
  MoneySphere,
  SplitMethod,
  User,
} from '../../types';
import {
  calculateEqualSplit,
  calculatePercentageSplit,
  calculateSharesSplit,
  generateSplitSense,
} from '../../lib/settlement-engine';
import { formatCurrency, toMinorUnits } from '../../lib/currency';
import {
  X,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Receipt as ReceiptIcon,
  Users,
} from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sphere: MoneySphere;
  currentUser: User;
  onExpenseCreated: (expenseData: any) => Promise<void>;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Rent',
  'Shopping',
  'Bills',
  'Entertainment',
  'Education',
  'Medical',
  'Other',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  sphere,
  currentUser,
  onExpenseCreated,
}) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paidById, setPaidById] = useState(currentUser.id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [description, setDescription] = useState('');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('EQUAL');

  // Participants selection & custom inputs
  const allMembers = sphere.members.map((m) => m.user);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(allMembers.map((m) => m.id));
  
  // Custom split inputs (for Exact, Percentage, Shares)
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, number>>({});

  // Receipt attachment
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize shares and percentages when members or splitMethod change
  useEffect(() => {
    if (selectedUserIds.length > 0) {
      // Default equal shares
      const initShares: Record<string, number> = {};
      const initPercentages: Record<string, string> = {};
      const equalPct = (100 / selectedUserIds.length).toFixed(1);
      selectedUserIds.forEach((uid) => {
        initShares[uid] = 1;
        initPercentages[uid] = equalPct;
      });
      setShares(initShares);
      setPercentages(initPercentages);
    }
  }, [sphere.id, splitMethod]);

  // Compute minor units amount safely
  const amountMinor = useMemo(() => {
    return toMinorUnits(amountStr);
  }, [amountStr]);

  // Live split calculation
  const calculatedSplits = useMemo(() => {
    if (amountMinor <= 0 || selectedUserIds.length === 0) return [];

    if (splitMethod === 'EQUAL') {
      const splits = calculateEqualSplit(amountMinor, selectedUserIds);
      return splits.map((s) => ({
        userId: s.userId,
        shareAmount: s.shareAmount,
        user: allMembers.find((m) => m.id === s.userId)!,
      }));
    }

    if (splitMethod === 'PERCENTAGE') {
      const pctList = selectedUserIds.map((uid) => ({
        userId: uid,
        percentage: parseFloat(percentages[uid] || '0') || 0,
      }));
      const splits = calculatePercentageSplit(amountMinor, pctList);
      return splits.map((s) => ({
        userId: s.userId,
        shareAmount: s.shareAmount,
        percentage: s.percentage,
        user: allMembers.find((m) => m.id === s.userId)!,
      }));
    }

    if (splitMethod === 'SHARES') {
      const shareList = selectedUserIds.map((uid) => ({
        userId: uid,
        shares: shares[uid] || 1,
      }));
      const splits = calculateSharesSplit(amountMinor, shareList);
      return splits.map((s) => ({
        userId: s.userId,
        shareAmount: s.shareAmount,
        shares: s.shares,
        user: allMembers.find((m) => m.id === s.userId)!,
      }));
    }

    if (splitMethod === 'EXACT') {
      return selectedUserIds.map((uid) => {
        const val = toMinorUnits(exactAmounts[uid] || '0');
        return {
          userId: uid,
          shareAmount: val,
          exactAmount: val,
          user: allMembers.find((m) => m.id === uid)!,
        };
      });
    }

    return [];
  }, [amountMinor, selectedUserIds, splitMethod, percentages, shares, exactAmounts, allMembers]);

  // Validation checks
  const splitValidation = useMemo(() => {
    if (amountMinor <= 0) return { isValid: false, message: 'Please enter a valid amount' };
    if (selectedUserIds.length === 0) return { isValid: false, message: 'Select at least one participant' };

    if (splitMethod === 'EXACT') {
      const totalEntered = calculatedSplits.reduce((sum, s) => sum + s.shareAmount, 0);
      const diff = amountMinor - totalEntered;
      if (Math.abs(diff) > 0) {
        return {
          isValid: false,
          message: `Exact shares sum to ${formatCurrency(totalEntered, sphere.currency)}. Difference: ${formatCurrency(diff, sphere.currency)}`,
        };
      }
    }

    if (splitMethod === 'PERCENTAGE') {
      const totalPct = selectedUserIds.reduce((sum, uid) => sum + (parseFloat(percentages[uid] || '0') || 0), 0);
      if (Math.abs(totalPct - 100) > 0.1) {
        return {
          isValid: false,
          message: `Percentages must total 100% (currently ${totalPct.toFixed(1)}%)`,
        };
      }
    }

    return { isValid: true, message: 'Split verified and balanced' };
  }, [amountMinor, selectedUserIds, splitMethod, calculatedSplits, percentages, sphere.currency]);

  // SplitSense assistant generated explanation
  const splitSense = useMemo(() => {
    const payer = allMembers.find((m) => m.id === paidById) || currentUser;
    return generateSplitSense(
      title || 'Untitled Expense',
      amountMinor,
      payer,
      calculatedSplits,
      splitMethod,
      sphere.currency
    );
  }, [title, amountMinor, paidById, calculatedSplits, splitMethod, sphere.currency, allMembers, currentUser]);

  // Handle receipt upload
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiptError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError('File exceeds maximum size of 5 MB');
      return;
    }

    // Validate mime/extension
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimes.includes(file.type)) {
      setReceiptError('Allowed formats: JPG, PNG, WEBP, or PDF');
      return;
    }

    setReceiptName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleMember = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      if (selectedUserIds.length > 1) {
        setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
      }
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!splitValidation.isValid) {
      setErrorMsg(splitValidation.message);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onExpenseCreated({
        title,
        amount: amountMinor,
        paidById,
        date: new Date(date).toISOString(),
        category,
        description,
        splitMethod,
        receiptUrl,
        receiptName,
        participants: calculatedSplits.map((s) => ({
          userId: s.userId,
          shareAmount: s.shareAmount,
          percentage: (s as any).percentage,
          shares: (s as any).shares,
          exactAmount: (s as any).exactAmount,
        })),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 w-full max-w-2xl my-8 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Expense to {sphere.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record payments, select participants, and preview smart live splits
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Title & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Expense Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Resort Booking, Seaside Dinner"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Total Amount ({sphere.currency}) *
              </label>
              <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden shadow-2xs">
                <span className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700/60 border-r border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  {sphere.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 bg-transparent text-slate-900 dark:text-white font-mono-tabular text-sm font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Paid by, Date, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Paid by
              </label>
              <select
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {allMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === currentUser.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participants Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Split With ({selectedUserIds.length} of {allMembers.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setSelectedUserIds(allMembers.map((m) => m.id))}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Select All
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {allMembers.map((m) => {
                const isSelected = selectedUserIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleToggleMember(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-60'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {m.name.charAt(0)}
                    </span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Method Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Split Method
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'] as SplitMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSplitMethod(method)}
                  className={`py-2 text-xs font-medium rounded-lg transition-colors capitalize ${
                    splitMethod === method
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {method.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* UNIQUE FEATURE #2: LIVE SPLIT PREVIEW */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Live Split Preview
              </span>
              <span
                className={`text-xs font-medium flex items-center gap-1 ${
                  splitValidation.isValid
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {splitValidation.isValid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Exact Balance</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{splitValidation.message}</span>
                  </>
                )}
              </span>
            </div>

            <div className="space-y-2">
              {calculatedSplits.map((split) => (
                <div
                  key={split.userId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-[10px]">
                      {split.user.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {split.user.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Input if splitMethod is EXACT */}
                    {splitMethod === 'EXACT' && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">{sphere.currency}</span>
                        <input
                          type="number"
                          step="0.01"
                          value={exactAmounts[split.userId] || ''}
                          onChange={(e) =>
                            setExactAmounts({ ...exactAmounts, [split.userId]: e.target.value })
                          }
                          className="w-20 px-2 py-1 text-right rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono-tabular"
                        />
                      </div>
                    )}

                    {/* Input if splitMethod is PERCENTAGE */}
                    {splitMethod === 'PERCENTAGE' && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={percentages[split.userId] || ''}
                          onChange={(e) =>
                            setPercentages({ ...percentages, [split.userId]: e.target.value })
                          }
                          className="w-16 px-2 py-1 text-right rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono-tabular"
                        />
                        <span className="text-slate-400">%</span>
                      </div>
                    )}

                    {/* Input if splitMethod is SHARES */}
                    {splitMethod === 'SHARES' && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={shares[split.userId] || 1}
                          onChange={(e) =>
                            setShares({ ...shares, [split.userId]: parseInt(e.target.value) || 1 })
                          }
                          className="w-14 px-2 py-1 text-right rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono-tabular"
                        />
                        <span className="text-slate-400">shares</span>
                      </div>
                    )}

                    {/* Calculated Minor units formatted */}
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 font-mono-tabular font-bold text-indigo-700 dark:text-indigo-300 text-xs shrink-0 text-right min-w-[76px]">
                      {formatCurrency(split.shareAmount, sphere.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UNIQUE FEATURE #3: SPLITSENSE ASSISTANT */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-violet-50/70 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                SplitSense™ Analysis
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {splitSense.headline}
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
              {splitSense.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
            <div className="mt-2 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-white/60 dark:bg-slate-900/40 p-2 rounded-lg">
              Recommendation: {splitSense.suggestedAction}
            </div>
          </div>

          {/* Receipt Upload & Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Receipt Attachment (Optional, max 5MB)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>{receiptName ? receiptName : 'Attach Receipt / Bill'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleReceiptChange}
                />
              </label>

              {receiptName && (
                <button
                  type="button"
                  onClick={() => {
                    setReceiptName(null);
                    setReceiptUrl(null);
                  }}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            {receiptError && (
              <p className="text-xs text-rose-600 mt-1">{receiptError}</p>
            )}

            {receiptUrl && receiptUrl.startsWith('data:image') && (
              <div className="mt-3 w-28 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={receiptUrl}
                  alt="Receipt Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes & Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about this expense..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !splitValidation.isValid}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
