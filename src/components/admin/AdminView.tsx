import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AuditLog, User } from '../../types';
import { formatCurrency } from '../../lib/currency';
import {
  ShieldAlert,
  Users,
  Compass,
  Receipt,
  CheckCircle2,
  Clock,
  History,
  AlertCircle,
} from 'lucide-react';

interface AdminViewProps {
  currentUser: User;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [overviewRes, usersRes] = await Promise.all([
          api.getAdminOverview(),
          api.getAdminUsers(),
        ]);
        setMetrics(overviewRes.metrics);
        setAuditLogs(overviewRes.auditLogs);
        setUsers(usersRes);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load admin telemetry');
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="orbit-surface p-12 text-center text-xs text-slate-400">
        Loading admin console telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin & Governance Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System metrics, platform users, and security audit log streams
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Superadmin Mode
        </span>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="orbit-surface p-4 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
              Registered Users
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono-tabular text-slate-900 dark:text-white my-1 block truncate">
              {metrics.totalUsers}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              Platform member accounts
            </span>
          </div>

          <div className="orbit-surface p-4 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
              Active Money Spheres
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono-tabular text-indigo-600 dark:text-indigo-400 my-1 block truncate">
              {metrics.totalSpheres}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              Trips, roommates & teams
            </span>
          </div>

          <div className="orbit-surface p-4 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
              Total Logged Expenses
            </span>
            <span
              className="text-lg sm:text-xl font-black font-mono-tabular text-slate-900 dark:text-white my-1 block truncate"
              title={formatCurrency(metrics.totalExpenseVolume)}
            >
              {formatCurrency(metrics.totalExpenseVolume)}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              {metrics.totalExpenses} transactions
            </span>
          </div>

          <div className="orbit-surface p-4 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
              Settled Volume
            </span>
            <span
              className="text-lg sm:text-xl font-black font-mono-tabular text-emerald-600 dark:text-emerald-400 my-1 block truncate"
              title={formatCurrency(metrics.totalSettledVolume)}
            >
              {formatCurrency(metrics.totalSettledVolume)}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              {metrics.totalSettlements} verified settlements
            </span>
          </div>
        </div>
      )}

      {/* Two columns: User Directory & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Directory */}
        <div className="lg:col-span-6 orbit-surface bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              User Directory ({users.length})
            </h3>
            <span className="text-xs text-slate-400">Database Records</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold flex items-center justify-center text-xs">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {u.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{u.email}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.role === 'ADMIN'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="lg:col-span-6 orbit-surface bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Security Audit Stream ({auditLogs.length})
            </h3>
            <span className="text-xs text-slate-400">Append-Only</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {log.details}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Actor: {log.userEmail || log.userId}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
