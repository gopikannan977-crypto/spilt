import React, { useState, useEffect } from 'react';
import { Logo } from '../brand/Logo';
import {
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Users,
  PieChart,
  Compass,
  CreditCard,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenLogin: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenLogin,
  darkMode,
  onToggleDarkMode,
}) => {
  // Hero interactive animation step:
  // Step 0: Initial spends (A: ₹1,200, B: ₹800, C: ₹0)
  // Step 1: Calculating split (Total ₹2,000 / 3 = ₹666.67 each)
  // Step 2: Final settled balance (A receives ₹533, B receives ₹133, C pays ₹666)
  const [orbitStep, setOrbitStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setOrbitStep((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const faqs = [
    {
      q: 'How does SplitSphere calculate optimized settlements?',
      a: 'SplitSphere employs a greedy min-cash-flow algorithm. Instead of everyone paying each other multiple redundant transactions, the engine balances total group credits and debts, producing the minimum practical number of direct payments (at most N-1 transactions).',
    },
    {
      q: 'Does SplitSphere hold my money or bank details?',
      a: 'No. SplitSphere is an expense tracking, smart allocation, and settlement orchestration platform. You settle directly via your preferred payment app (such as UPI, IMPS, or Cash), and SplitSphere verifies and reconciles balances across the shared sphere.',
    },
    {
      q: 'How are unequal splits and rounding errors handled?',
      a: 'All balances and transactions are computed in integer minor units (paise/cents). For equal splits with non-divisible remainders, our algorithm evenly distributes remaining units, ensuring total shares match the bill down to the last cent with zero floating point drift.',
    },
    {
      q: 'Can I use SplitSphere on mobile?',
      a: 'Yes. SplitSphere is built mobile-first with thumb-friendly controls, responsive slide drawers, bottom navigation, and full offline caching resilience.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation - Top Bar Contract */}
      <header className="sticky top-0 z-40 w-full bg-slate-50/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Zone 1: Brand Wordmark */}
          <Logo size="md" showTagline={false} />

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              How It Works
            </a>
            <a href="#smart-splitting" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Smart Splitting
            </a>
            <a href="#settlement-engine" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Settlement Engine
            </a>
            <a href="#security" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Security
            </a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onEnterApp}
              className="px-4.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Financial Orbit Architecture</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
              Every expense.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500">
                One clear balance.
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Split expenses, track shared spending, and settle group payments without the spreadsheet headache. Designed for trips, roommates, teams, and events.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onEnterApp}
                className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Create Your Sphere</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenLogin}
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-sm transition-colors text-center"
              >
                Sign In With Demo Accounts
              </button>
            </div>

            {/* Proof points */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Decimal-safe precision
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> One-Tap min cash flow
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Zero math friction
              </span>
            </div>
          </div>

          {/* Hero Visual: Animated Financial Orbit Calculation */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-500 ml-1">Goa Trip Sphere</span>
                </div>
                <span className="text-xs font-mono-tabular font-bold text-indigo-600 dark:text-indigo-400">
                  {orbitStep === 0 && 'Phase 1: Expenses Logged'}
                  {orbitStep === 1 && 'Phase 2: Calculating Split'}
                  {orbitStep === 2 && 'Phase 3: One-Tap Settlement'}
                </span>
              </div>

              {/* Orbit Animation Canvas */}
              <div className="py-8 relative flex items-center justify-center">
                <svg viewBox="0 0 340 260" className="w-full h-auto">
                  {/* Circular Orbit Ring */}
                  <circle
                    cx="170"
                    cy="130"
                    r="85"
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.25)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-[spin_30s_linear_infinite]"
                  />

                  {/* Connecting lines */}
                  {orbitStep === 2 ? (
                    // In phase 3: direct settlement path C -> A and C -> B
                    <g className="transition-all duration-500">
                      <line x1="85" y1="130" x2="170" y2="45" stroke="#10B981" strokeWidth="2.5" />
                      <line x1="255" y1="130" x2="170" y2="45" stroke="#6366F1" strokeWidth="2" />
                    </g>
                  ) : (
                    <g className="transition-all duration-500">
                      <line x1="170" y1="45" x2="85" y2="130" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />
                      <line x1="85" y1="130" x2="255" y2="130" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />
                      <line x1="255" y1="130" x2="170" y2="45" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />
                    </g>
                  )}

                  {/* Person A Node (Paid ₹1,200) */}
                  <g transform="translate(170, 45)">
                    <circle r="24" fill="#4338CA" className="drop-shadow-md" />
                    <text y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                      A
                    </text>
                    <text y="37" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">
                      Person A
                    </text>
                    <rect
                      x="-48"
                      y="42"
                      width="96"
                      height="17"
                      rx="8"
                      fill="#0F172A"
                      stroke={orbitStep === 2 ? '#10B981' : '#6366F1'}
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text
                      y="53.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                    >
                      {orbitStep === 0 && 'Paid ₹1,200'}
                      {orbitStep === 1 && 'Share ₹667'}
                      {orbitStep === 2 && 'Receives +₹533'}
                    </text>
                  </g>

                  {/* Person B Node (Paid ₹800) */}
                  <g transform="translate(255, 175)">
                    <circle r="22" fill="#7C3AED" className="drop-shadow-md" />
                    <text y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                      B
                    </text>
                    <text y="36" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">
                      Person B
                    </text>
                    <rect
                      x="-48"
                      y="40"
                      width="96"
                      height="17"
                      rx="8"
                      fill="#0F172A"
                      stroke={orbitStep === 2 ? '#10B981' : '#8B5CF6'}
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text
                      y="51.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                    >
                      {orbitStep === 0 && 'Paid ₹800'}
                      {orbitStep === 1 && 'Share ₹667'}
                      {orbitStep === 2 && 'Receives +₹133'}
                    </text>
                  </g>

                  {/* Person C Node (Paid ₹0) */}
                  <g transform="translate(85, 175)">
                    <circle r="22" fill="#E11D48" className="drop-shadow-md" />
                    <text y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                      C
                    </text>
                    <text y="36" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">
                      Person C
                    </text>
                    <rect
                      x="-48"
                      y="40"
                      width="96"
                      height="17"
                      rx="8"
                      fill="#0F172A"
                      stroke="#F43F5E"
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text
                      y="51.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                    >
                      {orbitStep === 0 && 'Paid ₹0'}
                      {orbitStep === 1 && 'Share ₹667'}
                      {orbitStep === 2 && 'Owes -₹667'}
                    </text>
                  </g>
                </svg>
              </div>

              {/* Status footer inside visual card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {orbitStep === 0 && (
                  <p>
                    <strong>Input:</strong> Total spent is ₹2,000 across 3 members.
                  </p>
                )}
                {orbitStep === 1 && (
                  <p>
                    <strong>Smart Split:</strong> Equal division requires ₹666.67 per person.
                  </p>
                )}
                {orbitStep === 2 && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    ✓ Simplified: Person C sends ₹533 to A and ₹133 to B. Total 2 transactions!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              The SplitSphere Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              From raw receipts to settled accounts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              The frictionless 4-step sequence engineered for precision and zero awkward reminders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Add Expense',
                desc: 'Upload receipts or enter details. Supports 9 categories and all major currencies.',
                icon: CreditCard,
              },
              {
                step: '02',
                title: 'Smart Split',
                desc: 'Split equally, by exact amount, percentage, or shares with live decimal validation.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Financial Orbit',
                desc: 'Live interactive network nodes visually expose who owes and who should receive.',
                icon: Compass,
              },
              {
                step: '04',
                title: 'One-Tap Settle',
                desc: 'Greedy min-cash-flow algorithm calculates the absolute fewest payments needed.',
                icon: Zap,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="orbit-surface p-6 bg-white dark:bg-slate-900/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono-tabular">
                      {item.step}
                    </span>
                    <item.icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SMART SPLITTING & SPLITSENSE */}
      <section id="smart-splitting" className="py-20 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Unique Feature #3
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              SplitSense™ Intelligence
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Never wonder if a split is fair. SplitSense provides immediate, deterministic business explanations of your spending distributions without fabricating estimates.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                  Equal Splits with Remainder Safety
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 block">
                  Non-divisible figures (e.g. ₹100 among 3 people) distribute remainders deterministically so sum of shares equals total down to 1 paisa.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                  Exact, Percentage & Share Weighting
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 block">
                  Allocate room costs by exact room price, drink bills by itemized share, or vehicle fuel by seat count.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  SplitSense Live Inspector
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs">
                <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                  "Candolim Beach Dinner & Drinks" (₹6,400.00)
                </p>
                <p className="text-indigo-700 dark:text-indigo-300 mt-1">
                  Saro paid full amount upfront for 4 participants.
                </p>
                <div className="mt-2 text-slate-600 dark:text-slate-400 space-y-0.5">
                  <p>· Saro net credit: +₹4,800.00</p>
                  <p>· Gopi share: -₹1,600.00</p>
                  <p>· Priya share: -₹1,600.00</p>
                  <p>· Karthik share: -₹1,600.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SETTLEMENT ENGINE */}
      <section id="settlement-engine" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Debt Simplification
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Simplify & Settle in One Tap
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Stop circular debt loops. Our engine matches maximum debtors to maximum creditors to minimize overall transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mb-1">
                Standard Chaos (Without SplitSphere)
              </span>
              <p className="text-xs text-slate-500 mb-4">
                4 roommates with 12 fragmented debts making 8 back-and-forth bank transfers.
              </p>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-mono">
                A owes B ₹200<br />
                B owes C ₹300<br />
                C owes A ₹100<br />
                D owes A & B ₹400
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-col justify-center text-center">
              <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Greedy Min-Cash-Flow Algorithm
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Evaluates net positions in O(N log N) time and eliminates redundant transfers entirely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                SplitSphere Optimized
              </span>
              <p className="text-xs text-slate-500 mb-4">
                Only 2 clean transactions needed. Everyone is 100% balanced.
              </p>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-mono">
                D → B: ₹300<br />
                D → A: ₹100<br />
                All balances: ₹0.00
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY & PRIVACY */}
      <section id="security" className="py-20 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Bank-Grade Security Architecture
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We never hold user deposits or take custody of financial instruments. Your data is protected by cryptographic tokens, secure HTTP-only cookies, strict ownership audits, and sanitized input validation.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openFaq === i && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" showTagline={true} />

          <div className="flex items-center gap-6">
            <button onClick={onEnterApp} className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Launch App
            </button>
            <button onClick={onOpenLogin} className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Demo Accounts
            </button>
            <button
              onClick={onToggleDarkMode}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {darkMode ? 'Light Theme' : 'Dark Theme'}
            </button>
          </div>

          <div>
            © {new Date().getFullYear()} SplitSphere. Every expense. One clear balance.
          </div>
        </div>
      </footer>
    </div>
  );
};
