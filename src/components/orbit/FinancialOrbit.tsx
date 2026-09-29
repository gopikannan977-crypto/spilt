import React, { useState } from 'react';
import { MemberBalance, SimplifiedTransaction, User } from '../../types';
import { formatCurrency, formatNetBalance } from '../../lib/currency';
import { UserCheck, ArrowRight, ShieldCheck, Zap, X } from 'lucide-react';

interface FinancialOrbitProps {
  balances: MemberBalance[];
  transactions: SimplifiedTransaction[];
  onSettleClick?: (fromUser: User, toUser: User, amount: number) => void;
  onRequestClick?: (fromUser: User, toUser: User, amount: number) => void;
}

export const FinancialOrbit: React.FC<FinancialOrbitProps> = ({
  balances,
  transactions,
  onSettleClick,
  onRequestClick,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (!balances || balances.length === 0) {
    return (
      <div className="orbit-surface p-8 text-center text-slate-500 dark:text-slate-400">
        No member orbits found in this sphere.
      </div>
    );
  }

  // Calculate coordinates in a circle (center cx=200, cy=200, radius=130)
  const width = 420;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const r = 135;

  const nodePositions = balances.map((b, index) => {
    const angle = (index * 2 * Math.PI) / balances.length - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return {
      userId: b.userId,
      user: b.user,
      balance: b,
      x,
      y,
    };
  });

  const selectedNode = nodePositions.find((n) => n.userId === selectedUserId) || nodePositions[0];

  return (
    <div className="orbit-surface p-6 relative overflow-hidden bg-white/70 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Financial Orbit
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              Live Flow
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive network of mutual balances and optimized debt pathways
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {transactions.length === 0 ? 'Fully Settled' : `${transactions.length} transfers needed`}
          </span>
        </div>
      </div>

      {/* Main Orbit Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Orbit Visualizer */}
        <div className="lg:col-span-7 flex justify-center relative select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-[380px] h-auto drop-shadow-sm"
          >
            <defs>
              <linearGradient id="orbit-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4338CA" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
              </linearGradient>

              <marker
                id="arrowhead-red"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#F43F5E" />
              </marker>

              <marker
                id="arrowhead-indigo"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#6366F1" />
              </marker>
            </defs>

            {/* Orbit concentric track circles */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="url(#orbit-ring-grad)"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="animate-[spin_40s_linear_infinite]"
            />
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.55}
              fill="none"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="1"
            />

            {/* Center Core Indicator */}
            <g transform={`translate(${cx}, ${cy})`}>
              <circle
                r="30"
                fill="currentColor"
                className="text-indigo-50/70 dark:text-indigo-950/40"
              />
              <circle
                r="18"
                fill="currentColor"
                className="text-indigo-600 dark:text-indigo-500 opacity-20 animate-pulse"
              />
              <circle r="7" fill="#4338CA" />
              <text
                y="3"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="7"
                fontWeight="bold"
              >
                CORE
              </text>
            </g>

            {/* Transaction Vector Connections */}
            {transactions.map((tx, idx) => {
              const fromNode = nodePositions.find((n) => n.userId === tx.fromUserId);
              const toNode = nodePositions.find((n) => n.userId === tx.toUserId);
              if (!fromNode || !toNode) return null;

              // Compute mid point curve
              const midX = (fromNode.x + toNode.x) / 2 + (cx - (fromNode.x + toNode.x) / 2) * 0.2;
              const midY = (fromNode.y + toNode.y) / 2 + (cy - (fromNode.y + toNode.y) / 2) * 0.2;

              const isHighlighted =
                selectedUserId === tx.fromUserId || selectedUserId === tx.toUserId;

              const amtStr = formatCurrency(tx.amount, tx.currency);
              const badgeWidth = Math.max(68, amtStr.length * 8 + 18);

              return (
                <g key={`tx-${idx}`} className="transition-all duration-300">
                  <path
                    d={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`}
                    fill="none"
                    stroke={isHighlighted ? '#6366F1' : 'rgba(148, 163, 184, 0.45)'}
                    strokeWidth={isHighlighted ? 3 : 1.75}
                    markerEnd={isHighlighted ? 'url(#arrowhead-indigo)' : 'url(#arrowhead-red)'}
                    className="transition-all duration-200"
                  />
                  {/* Amount Badge at curve apex - perfectly sized box */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-badgeWidth / 2}
                      y="-11"
                      width={badgeWidth}
                      height="22"
                      rx="11"
                      fill="#0F172A"
                      stroke={isHighlighted ? '#818CF8' : '#334155'}
                      strokeWidth="1.2"
                      opacity="0.96"
                    />
                    <text
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {amtStr}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Member Orbit Nodes */}
            {nodePositions.map((node) => {
              const isSelected = selectedUserId === node.userId;
              const { text, isPositive, isZero } = formatNetBalance(node.balance.netBalance);
              const statusColor = isZero
                ? '#10B981'
                : isPositive
                ? '#059669'
                : '#E11D48';

              const balanceText = isZero ? 'Settled' : text;
              const badgeBoxWidth = Math.max(54, balanceText.length * 7 + 14);

              return (
                <g
                  key={node.userId}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedUserId(node.userId)}
                >
                  {/* Highlight halo */}
                  {isSelected && (
                    <circle
                      r="33"
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Outer status ring */}
                  <circle
                    r="25"
                    fill="#FFFFFF"
                    className="dark:fill-slate-800 transition-transform group-hover:scale-110 shadow-sm"
                    stroke={statusColor}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Initial / Avatar */}
                  <text
                    y="5"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-slate-800 dark:text-slate-100 font-bold select-none pointer-events-none"
                    fontSize="13"
                  >
                    {node.user.name.charAt(0)}
                  </text>

                  {/* Name label beneath node */}
                  <text
                    y="37"
                    textAnchor="middle"
                    className="text-slate-700 dark:text-slate-300 font-semibold select-none pointer-events-none"
                    fontSize="11"
                  >
                    {node.user.name.split(' ')[0]}
                  </text>

                  {/* Balance badge box beneath name */}
                  <rect
                    x={-badgeBoxWidth / 2}
                    y="42"
                    width={badgeBoxWidth}
                    height="16"
                    rx="8"
                    fill="#0F172A"
                    stroke={statusColor}
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text
                    y="53.5"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    className="font-mono-tabular font-bold select-none pointer-events-none"
                    fontSize="8.5"
                  >
                    {balanceText}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Member Detail Card */}
        <div className="lg:col-span-5 bg-slate-50/80 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {selectedNode.user.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                  {selectedNode.user.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedNode.user.email}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                Net Status
              </span>
              <div
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono-tabular inline-block ${
                  selectedNode.balance.netBalance > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                    : selectedNode.balance.netBalance < 0
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {formatNetBalance(selectedNode.balance.netBalance).text}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Total Paid</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white font-mono-tabular inline-block">
                {formatCurrency(selectedNode.balance.totalPaid)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Total Owed</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white font-mono-tabular inline-block">
                {formatCurrency(selectedNode.balance.totalOwed)}
              </span>
            </div>
          </div>

          {/* Direct Action Pathway for this user */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
              Direct Settlement Pathways:
            </span>

            {transactions.filter(
              (t) => t.fromUserId === selectedNode.userId || t.toUserId === selectedNode.userId
            ).length === 0 ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All balances are zero for this member. Perfectly settled!</span>
              </div>
            ) : (
              transactions
                .filter(
                  (t) => t.fromUserId === selectedNode.userId || t.toUserId === selectedNode.userId
                )
                .map((t, i) => {
                  const isDebtor = t.fromUserId === selectedNode.userId;
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {isDebtor ? 'Owes' : 'Receives from'}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {isDebtor ? t.toUser.name : t.fromUser.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 font-mono-tabular font-bold text-indigo-700 dark:text-indigo-300 text-xs">
                          {formatCurrency(t.amount, t.currency)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isDebtor && onSettleClick && (
                          <button
                            onClick={() => onSettleClick(t.fromUser, t.toUser, t.amount)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          >
                            Settle
                          </button>
                        )}
                        {!isDebtor && onRequestClick && (
                          <button
                            onClick={() => onRequestClick(t.toUser, t.fromUser, t.amount)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                          >
                            Request
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
