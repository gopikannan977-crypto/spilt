import React, { useState, useEffect, useCallback } from 'react';
import { api, setStoredToken } from './lib/api';
import {
  AppNotification,
  DeterministicInsight,
  Expense,
  MemberBalance,
  MoneySphere,
  PaymentRequest,
  Settlement,
  SimplifiedTransaction,
  SphereBalancesResponse,
  User,
} from './types';

// Components
import { LandingPage } from './components/landing/LandingPage';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { SpheresView } from './components/spheres/SpheresView';
import { SphereDetailView } from './components/spheres/SphereDetailView';
import { PaymentRequestsView } from './components/payments/PaymentRequestsView';
import { ActivityView } from './components/activity/ActivityView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AdminView } from './components/admin/AdminView';

// Modals
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { SettlementModal } from './components/settlement/SettlementModal';
import { PaymentRequestModal } from './components/payments/PaymentRequestModal';
import { CreateSphereModal } from './components/spheres/CreateSphereModal';
import { CommandPalette } from './components/search/CommandPalette';
import { AuthModal } from './components/auth/AuthModal';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('splitsphere_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('splitsphere_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('splitsphere_theme', 'light');
    }
  }, [darkMode]);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Application view state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedSphereId, setSelectedSphereId] = useState<string | null>(null);

  // Core domain data
  const [spheres, setSpheres] = useState<MoneySphere[]>([]);
  const [activeSphere, setActiveSphere] = useState<MoneySphere | null>(null);
  const [activeSphereExpenses, setActiveSphereExpenses] = useState<Expense[]>([]);
  const [activeSphereSettlements, setActiveSphereSettlements] = useState<Settlement[]>([]);
  const [activeSphereBalances, setActiveSphereBalances] = useState<SphereBalancesResponse | null>(null);

  // Global aggregate data
  const [dashboardData, setDashboardData] = useState<{
    netBalance: number;
    youAreOwed: number;
    youOwe: number;
    totalSpent: number;
    spheresCount: number;
    expensesCount: number;
    settlementsCount: number;
    insights: DeterministicInsight[];
    categoryDistribution: { category: string; amount: number }[];
    monthlySpending: { month: string; amount: number }[];
  }>({
    netBalance: 0,
    youAreOwed: 0,
    youOwe: 0,
    totalSpent: 0,
    spheresCount: 0,
    expensesCount: 0,
    settlementsCount: 0,
    insights: [],
    categoryDistribution: [],
    monthlySpending: [],
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Modals visibility state
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showCreateSphereModal, setShowCreateSphereModal] = useState(false);
  const [showSearchPalette, setShowSearchPalette] = useState(false);
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const [paymentRequestInitial, setPaymentRequestInitial] = useState<{
    sphereId?: string;
    toUserId?: string;
    amountMinor?: number;
  }>({});

  const [settlementModalData, setSettlementModalData] = useState<{
    isOpen: boolean;
    fromUser: User | null;
    toUser: User | null;
    amountMinor: number;
    sphereId: string;
    currency: any;
  }>({
    isOpen: false,
    fromUser: null,
    toUser: null,
    amountMinor: 0,
    sphereId: '',
    currency: 'INR',
  });

  // Load initial demo users and user session
  const initializeAuth = useCallback(async () => {
    try {
      const demoList = await api.getDemoUsers();
      setDemoUsers(demoList);

      try {
        const meRes = await api.getMe();
        setCurrentUser(meRes.user);
      } catch (err) {
        // Not logged in yet
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Failed to load demo accounts:', err);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Load user data once authenticated
  const loadUserData = useCallback(async () => {
    if (!currentUser) return;

    try {
      const [spheresList, dashRes, actRes, reqsRes, notifsRes] = await Promise.all([
        api.getSpheres(),
        api.getDashboardAnalytics(),
        api.getActivity(),
        api.getPaymentRequests(),
        api.getNotifications(),
      ]);

      setSpheres(spheresList);
      setDashboardData(dashRes);
      setRecentActivity(actRes);
      setPaymentRequests(reqsRes);
      setNotifications(notifsRes);

      // If a sphere is selected, load its detailed balances
      const sphereToLoad = selectedSphereId || (spheresList.length > 0 ? spheresList[0].id : null);
      if (sphereToLoad) {
        loadSphereDetails(sphereToLoad);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  }, [currentUser, selectedSphereId]);

  const loadSphereDetails = async (sphereId: string) => {
    try {
      const [sphereRes, expensesRes, settlementsRes, balancesRes] = await Promise.all([
        api.getSphere(sphereId),
        api.getSphereExpenses(sphereId),
        api.getSphereSettlements(sphereId),
        api.getSphereBalances(sphereId),
      ]);

      setActiveSphere(sphereRes);
      setActiveSphereExpenses(expensesRes);
      setActiveSphereSettlements(settlementsRes);
      setActiveSphereBalances(balancesRes);
    } catch (err) {
      console.error(`Failed to load sphere ${sphereId} details:`, err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  // Realtime SSE event listener
  useEffect(() => {
    if (!currentUser) return;

    const eventSource = new EventSource(`/api/events?userId=${currentUser.id}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'connected') return;

        // Background reload data on any mutation
        loadUserData();
        if (selectedSphereId && payload.sphereId === selectedSphereId) {
          loadSphereDetails(selectedSphereId);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [currentUser, selectedSphereId, loadUserData]);

  // Auth Handlers
  const handleLogin = async (data: { email: string; password: string }) => {
    const res = await api.login(data);
    setStoredToken(res.token);
    setCurrentUser(res.user);
  };

  const handleRegister = async (data: { name: string; email: string; password: string }) => {
    const res = await api.register(data);
    setStoredToken(res.token);
    setCurrentUser(res.user);
  };

  const handleSwitchDemoUser = async (userId: string) => {
    const res = await api.switchDemoUser(userId);
    setStoredToken(res.token);
    setCurrentUser(res.user);
  };

  const handleLogout = async () => {
    await api.logout();
    setStoredToken(null);
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  // Expense Handlers
  const handleCreateExpense = async (expenseData: any) => {
    const targetSphereId = selectedSphereId || (spheres[0]?.id || '');
    if (!targetSphereId) throw new Error('No active Money Sphere found.');

    await api.createExpense(targetSphereId, expenseData);
    await loadUserData();
    if (selectedSphereId) {
      await loadSphereDetails(selectedSphereId);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await api.deleteExpense(expenseId);
    await loadUserData();
    if (selectedSphereId) {
      await loadSphereDetails(selectedSphereId);
    }
  };

  // Settlement Handlers
  const handleRecordSettlement = async (settlementData: any) => {
    const targetSphereId = settlementModalData.sphereId || selectedSphereId || (spheres[0]?.id || '');
    await api.recordSettlement(targetSphereId, settlementData);
    await loadUserData();
    if (selectedSphereId) {
      await loadSphereDetails(selectedSphereId);
    }
  };

  const handleOpenSettlement = (fromUser: User, toUser: User, amount: number) => {
    const targetSphere = activeSphere || spheres[0];
    setSettlementModalData({
      isOpen: true,
      fromUser,
      toUser,
      amountMinor: amount,
      sphereId: targetSphere?.id || '',
      currency: targetSphere?.currency || 'INR',
    });
  };

  // Payment Request Handlers
  const handleSendPaymentRequest = async (reqData: any) => {
    await api.createPaymentRequest(reqData);
    await loadUserData();
  };

  const handleUpdatePaymentRequestStatus = async (id: string, status: 'PAID' | 'REJECTED') => {
    await api.updatePaymentRequest(id, { status });
    await loadUserData();
    if (selectedSphereId) {
      await loadSphereDetails(selectedSphereId);
    }
  };

  // Sphere Handlers
  const handleCreateSphere = async (sphereData: any) => {
    const newSphere = await api.createSphere(sphereData);
    await loadUserData();
    setSelectedSphereId(newSphere.id);
    setCurrentView('sphere-detail');
  };

  const handleAddMember = async (email: string, name?: string) => {
    if (!selectedSphereId) return;
    await api.addSphereMember(selectedSphereId, { email, name });
    await loadSphereDetails(selectedSphereId);
  };

  // Notification Handlers
  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Navigation Helper
  const handleSelectSphere = (sphereId: string) => {
    setSelectedSphereId(sphereId);
    loadSphereDetails(sphereId);
    setCurrentView('sphere-detail');
  };

  // If initial auth is still checking
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            Initializing SplitSphere...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render premium Landing Page with Demo Quick Enter
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onEnterApp={() => {
            // Default demo login as Gopi (Admin)
            const gopi = demoUsers.find((u) => u.email === 'gopi@example.com') || demoUsers[0];
            if (gopi) {
              handleSwitchDemoUser(gopi.id);
            } else {
              setShowAuthModal(true);
            }
          }}
          onOpenLogin={() => setShowAuthModal(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          demoUsers={demoUsers}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSwitchDemo={handleSwitchDemoUser}
        />
      </>
    );
  }

  // Active Sphere or fallback for modal references
  const modalSphere =
    (selectedSphereId ? spheres.find((s) => s.id === selectedSphereId) : null) ||
    activeSphere ||
    spheres[0];

  return (
    <AppShell
      currentView={currentView}
      onNavigate={(v) => {
        if (v === 'spheres') setSelectedSphereId(null);
        setCurrentView(v);
      }}
      currentUser={currentUser}
      allDemoUsers={demoUsers}
      spheres={spheres}
      notifications={notifications}
      onSwitchUser={handleSwitchDemoUser}
      onLogout={handleLogout}
      onOpenAddExpense={() => setShowAddExpenseModal(true)}
      onOpenCreateSphere={() => setShowCreateSphereModal(true)}
      onOpenSearch={() => setShowSearchPalette(true)}
      onMarkNotificationRead={handleMarkNotificationRead}
      onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      darkMode={darkMode}
      onToggleDarkMode={() => setDarkMode(!darkMode)}
    >
      {/* 1. Dashboard View */}
      {currentView === 'dashboard' && (
        <DashboardView
          currentUser={currentUser}
          netBalance={dashboardData.netBalance}
          youAreOwed={dashboardData.youAreOwed}
          youOwe={dashboardData.youOwe}
          totalSpent={dashboardData.totalSpent}
          spheres={spheres}
          insights={dashboardData.insights}
          recentActivity={recentActivity}
          orbitBalances={activeSphereBalances?.memberBalances || []}
          orbitTransactions={activeSphereBalances?.optimizedSettlements || []}
          onOpenAddExpense={() => setShowAddExpenseModal(true)}
          onOpenCreateSphere={() => setShowCreateSphereModal(true)}
          onOpenPaymentRequest={() => {
            setPaymentRequestInitial({});
            setShowPaymentRequestModal(true);
          }}
          onSelectSphere={handleSelectSphere}
          onOpenSettlement={handleOpenSettlement}
          onNavigate={(v) => setCurrentView(v)}
        />
      )}

      {/* 2. Spheres List View */}
      {currentView === 'spheres' && (
        <SpheresView
          spheres={spheres}
          onSelectSphere={handleSelectSphere}
          onOpenCreateSphere={() => setShowCreateSphereModal(true)}
        />
      )}

      {/* 3. Sphere Detail View */}
      {currentView === 'sphere-detail' && activeSphere && (
        <SphereDetailView
          sphere={activeSphere}
          currentUser={currentUser}
          expenses={activeSphereExpenses}
          settlements={activeSphereSettlements}
          balances={activeSphereBalances}
          onBack={() => {
            setSelectedSphereId(null);
            setCurrentView('spheres');
          }}
          onOpenAddExpense={() => setShowAddExpenseModal(true)}
          onOpenSettlement={handleOpenSettlement}
          onOpenPaymentRequest={(toUser, amt) => {
            setPaymentRequestInitial({
              sphereId: activeSphere.id,
              toUserId: toUser?.id,
              amountMinor: amt,
            });
            setShowPaymentRequestModal(true);
          }}
          onDeleteExpense={handleDeleteExpense}
          onAddMember={handleAddMember}
        />
      )}

      {/* 4. Payment Requests View */}
      {currentView === 'payments' && (
        <PaymentRequestsView
          currentUser={currentUser}
          paymentRequests={paymentRequests}
          onOpenCreateRequest={() => {
            setPaymentRequestInitial({});
            setShowPaymentRequestModal(true);
          }}
          onUpdateStatus={handleUpdatePaymentRequestStatus}
          onSettleRequest={(pr) => {
            if (pr.toUser && pr.fromUser) {
              handleOpenSettlement(pr.toUser, pr.fromUser, pr.amount);
            }
          }}
        />
      )}

      {/* 5. Activity Ledger View */}
      {currentView === 'activity' && <ActivityView activity={recentActivity} />}

      {/* 6. Analytics View */}
      {currentView === 'analytics' && (
        <AnalyticsView
          totalSpent={dashboardData.totalSpent}
          spheresCount={dashboardData.spheresCount}
          expensesCount={dashboardData.expensesCount}
          settlementsCount={dashboardData.settlementsCount}
          insights={dashboardData.insights}
          categoryDistribution={dashboardData.categoryDistribution}
          monthlySpending={dashboardData.monthlySpending}
          spheres={spheres}
        />
      )}

      {/* 7. Admin Panel View */}
      {currentView === 'admin' && <AdminView currentUser={currentUser} />}

      {/* MODALS */}
      {modalSphere && (
        <ExpenseModal
          isOpen={showAddExpenseModal}
          onClose={() => setShowAddExpenseModal(false)}
          sphere={modalSphere}
          currentUser={currentUser}
          onExpenseCreated={handleCreateExpense}
        />
      )}

      <CreateSphereModal
        isOpen={showCreateSphereModal}
        onClose={() => setShowCreateSphereModal(false)}
        currentUser={currentUser}
        allKnownUsers={demoUsers}
        onSphereCreated={handleCreateSphere}
      />

      <PaymentRequestModal
        isOpen={showPaymentRequestModal}
        onClose={() => setShowPaymentRequestModal(false)}
        spheres={spheres}
        currentUser={currentUser}
        initialSphereId={paymentRequestInitial.sphereId}
        initialToUserId={paymentRequestInitial.toUserId}
        initialAmountMinor={paymentRequestInitial.amountMinor}
        onRequestSent={handleSendPaymentRequest}
      />

      {settlementModalData.isOpen && settlementModalData.fromUser && settlementModalData.toUser && (
        <SettlementModal
          isOpen={settlementModalData.isOpen}
          onClose={() =>
            setSettlementModalData((prev) => ({ ...prev, isOpen: false }))
          }
          sphereId={settlementModalData.sphereId}
          currency={settlementModalData.currency}
          fromUser={settlementModalData.fromUser}
          toUser={settlementModalData.toUser}
          suggestedAmountMinor={settlementModalData.amountMinor}
          onSettlementRecorded={handleRecordSettlement}
        />
      )}

      <CommandPalette
        isOpen={showSearchPalette}
        onClose={() => setShowSearchPalette(false)}
        spheres={spheres}
        allUsers={demoUsers}
        onSelectSphere={handleSelectSphere}
        onOpenAddExpense={() => setShowAddExpenseModal(true)}
        onOpenCreateSphere={() => setShowCreateSphereModal(true)}
        onNavigate={(v) => setCurrentView(v)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        demoUsers={demoUsers}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onSwitchDemo={handleSwitchDemoUser}
      />
    </AppShell>
  );
}
