import React, { useState } from 'react';
import { PaymentRequest, User } from '../../types';
import { formatCurrency } from '../../lib/currency';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ShieldCheck,
} from 'lucide-react';

interface PaymentRequestsViewProps {
  currentUser: User;
  paymentRequests: PaymentRequest[];
  onOpenCreateRequest: () => void;
  onUpdateStatus: (id: string, status: 'PAID' | 'REJECTED') => Promise<void>;
  onSettleRequest: (request: PaymentRequest) => void;
}

export const PaymentRequestsView: React.FC<PaymentRequestsViewProps> = ({
  currentUser,
  paymentRequests,
  onOpenCreateRequest,
  onUpdateStatus,
  onSettleRequest,
}) => {
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Incoming: requests where toUserId === currentUser.id (someone asks you for money)
  const incoming = paymentRequests.filter((pr) => pr.toUserId === currentUser.id);
  // Outgoing: requests where fromUserId === currentUser.id (you asked someone)
  const outgoing = paymentRequests.filter((pr) => pr.fromUserId === currentUser.id);

  const activeList = tab === 'incoming' ? incoming : outgoing;

  const handleAction = async (id: string, status: 'PAID' | 'REJECTED') => {
    setIsUpdating(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Payments & Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Request funds, review incoming demands, and record peer settlements
          </p>
        </div>

        <button
          onClick={onOpenCreateRequest}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Money</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setTab('incoming')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            tab === 'incoming'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-amber-500" />
          <span>Incoming Requests ({incoming.filter((r) => r.status === 'PENDING').length} pending)</span>
        </button>

        <button
          onClick={() => setTab('outgoing')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            tab === 'outgoing'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-indigo-500" />
          <span>Outgoing Sent ({outgoing.length})</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="orbit-surface bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {activeList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No {tab} payment requests found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeList.map((pr) => {
              const isPending = pr.status === 'PENDING';
              return (
                <div
                  key={pr.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        pr.status === 'PAID'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                          : pr.status === 'REJECTED'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                      }`}
                    >
                      {pr.status === 'PAID' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : pr.status === 'REJECTED' ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {tab === 'incoming'
                            ? `${pr.fromUser?.name} requested from you`
                            : `You requested from ${pr.toUser?.name}`}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            pr.status === 'PAID'
                              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                              : pr.status === 'REJECTED'
                              ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                              : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                          }`}
                        >
                          {pr.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {pr.sphereName} · {pr.note || 'No note attached'} ·{' '}
                        {new Date(pr.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-sm sm:text-base font-black font-mono-tabular text-slate-900 dark:text-white">
                      {formatCurrency(pr.amount, pr.currency)}
                    </span>

                    {/* Action buttons if you are recipient and request is PENDING */}
                    {tab === 'incoming' && isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSettleRequest(pr)}
                          disabled={isUpdating === pr.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                        >
                          Pay / Settle
                        </button>
                        <button
                          onClick={() => handleAction(pr.id, 'REJECTED')}
                          disabled={isUpdating === pr.id}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
