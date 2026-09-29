import {
  AppNotification,
  AuditLog,
  Expense,
  MoneySphere,
  PaymentRequest,
  Settlement,
  User,
} from '../types';

export interface DbUser extends User {
  passwordHash: string;
}

export class InMemoryDatabase {
  users: Map<string, DbUser> = new Map();
  spheres: Map<string, MoneySphere> = new Map();
  expenses: Map<string, Expense> = new Map();
  settlements: Map<string, Settlement> = new Map();
  paymentRequests: Map<string, PaymentRequest> = new Map();
  notifications: Map<string, AppNotification> = new Map();
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Seed Users
    const uGopi: DbUser = {
      id: 'usr_gopi_001',
      name: 'Gopi M',
      email: 'gopi@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'ADMIN',
      createdAt: '2026-01-10T08:00:00.000Z',
      passwordHash: 'SplitSphere2026!', // In production bcrypt hash; dev simplified
    };

    const uSaro: DbUser = {
      id: 'usr_saro_002',
      name: 'Saro',
      email: 'saro@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'USER',
      createdAt: '2026-01-11T09:30:00.000Z',
      passwordHash: 'SplitSphere2026!',
    };

    const uPriya: DbUser = {
      id: 'usr_priya_003',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'USER',
      createdAt: '2026-01-12T11:15:00.000Z',
      passwordHash: 'SplitSphere2026!',
    };

    const uKarthik: DbUser = {
      id: 'usr_karthik_004',
      name: 'Karthik R',
      email: 'karthik@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'USER',
      createdAt: '2026-01-14T14:45:00.000Z',
      passwordHash: 'SplitSphere2026!',
    };

    [uGopi, uSaro, uPriya, uKarthik].forEach((u) => this.users.set(u.id, u));

    // 2. Seed Spheres
    const sGoa: MoneySphere = {
      id: 'sph_goa_01',
      name: 'Goa Coastal Retreat',
      description: 'Beach villa rental, seaside meals, watersports, and shared scooter fuel.',
      category: 'TRAVEL',
      currency: 'INR',
      coverGradient: 'from-indigo-600 via-violet-600 to-purple-700',
      createdBy: uGopi.id,
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-03-28T16:00:00.000Z',
      members: [
        { id: 'sm_1', sphereId: 'sph_goa_01', userId: uGopi.id, role: 'ADMIN', joinedAt: '2026-02-01T10:00:00.000Z', user: uGopi },
        { id: 'sm_2', sphereId: 'sph_goa_01', userId: uSaro.id, role: 'MEMBER', joinedAt: '2026-02-01T10:15:00.000Z', user: uSaro },
        { id: 'sm_3', sphereId: 'sph_goa_01', userId: uPriya.id, role: 'MEMBER', joinedAt: '2026-02-01T10:20:00.000Z', user: uPriya },
        { id: 'sm_4', sphereId: 'sph_goa_01', userId: uKarthik.id, role: 'MEMBER', joinedAt: '2026-02-01T10:30:00.000Z', user: uKarthik },
      ],
    };

    const sApt: MoneySphere = {
      id: 'sph_apt_02',
      name: 'Apartment 402 Shared Living',
      description: 'Monthly fiber broadband, groceries, deep cleaning, and utility bills.',
      category: 'APARTMENT',
      currency: 'INR',
      coverGradient: 'from-emerald-600 to-teal-700',
      createdBy: uSaro.id,
      createdAt: '2026-01-15T09:00:00.000Z',
      updatedAt: '2026-03-25T11:00:00.000Z',
      members: [
        { id: 'sm_5', sphereId: 'sph_apt_02', userId: uGopi.id, role: 'MEMBER', joinedAt: '2026-01-15T09:05:00.000Z', user: uGopi },
        { id: 'sm_6', sphereId: 'sph_apt_02', userId: uSaro.id, role: 'ADMIN', joinedAt: '2026-01-15T09:00:00.000Z', user: uSaro },
        { id: 'sm_7', sphereId: 'sph_apt_02', userId: uPriya.id, role: 'MEMBER', joinedAt: '2026-01-15T09:10:00.000Z', user: uPriya },
      ],
    };

    const sOffice: MoneySphere = {
      id: 'sph_office_03',
      name: 'Office Lunch & Coffee Club',
      description: 'Weekday group orders, coffee runs, and team celebration snacks.',
      category: 'OFFICE',
      currency: 'INR',
      coverGradient: 'from-blue-600 to-indigo-800',
      createdBy: uGopi.id,
      createdAt: '2026-02-20T12:00:00.000Z',
      updatedAt: '2026-03-27T14:00:00.000Z',
      members: [
        { id: 'sm_8', sphereId: 'sph_office_03', userId: uGopi.id, role: 'ADMIN', joinedAt: '2026-02-20T12:00:00.000Z', user: uGopi },
        { id: 'sm_9', sphereId: 'sph_office_03', userId: uSaro.id, role: 'MEMBER', joinedAt: '2026-02-20T12:05:00.000Z', user: uSaro },
        { id: 'sm_10', sphereId: 'sph_office_03', userId: uPriya.id, role: 'MEMBER', joinedAt: '2026-02-20T12:10:00.000Z', user: uPriya },
      ],
    };

    [sGoa, sApt, sOffice].forEach((s) => this.spheres.set(s.id, s));

    // 3. Seed Expenses for Goa Trip
    // Total villa: ₹32,000 (3200000 minor)
    const e1: Expense = {
      id: 'exp_01',
      sphereId: sGoa.id,
      title: 'Heritage Beach Villa (3 Nights)',
      amount: 3200000,
      currency: 'INR',
      paidById: uGopi.id,
      paidBy: uGopi,
      date: '2026-03-20T15:00:00.000Z',
      category: 'Travel',
      description: 'Private 3-bedroom Portuguese villa facing Anjuna beach with swimming pool.',
      splitMethod: 'EQUAL',
      participants: [
        { id: 'ep_1', expenseId: 'exp_01', userId: uGopi.id, shareAmount: 800000, user: uGopi },
        { id: 'ep_2', expenseId: 'exp_01', userId: uSaro.id, shareAmount: 800000, user: uSaro },
        { id: 'ep_3', expenseId: 'exp_01', userId: uPriya.id, shareAmount: 800000, user: uPriya },
        { id: 'ep_4', expenseId: 'exp_01', userId: uKarthik.id, shareAmount: 800000, user: uKarthik },
      ],
      createdAt: '2026-03-20T15:30:00.000Z',
      updatedAt: '2026-03-20T15:30:00.000Z',
    };

    // Dinner: ₹6,400 (640000 minor) paid by Saro
    const e2: Expense = {
      id: 'exp_02',
      sphereId: sGoa.id,
      title: 'Candolim Sunset Dinner & Seafood',
      amount: 640000,
      currency: 'INR',
      paidById: uSaro.id,
      paidBy: uSaro,
      date: '2026-03-21T21:00:00.000Z',
      category: 'Food',
      description: 'Fresh butter garlic prawns, Kingfish curry, sourdough garlic bread, drinks.',
      splitMethod: 'EQUAL',
      participants: [
        { id: 'ep_5', expenseId: 'exp_02', userId: uGopi.id, shareAmount: 160000, user: uGopi },
        { id: 'ep_6', expenseId: 'exp_02', userId: uSaro.id, shareAmount: 160000, user: uSaro },
        { id: 'ep_7', expenseId: 'exp_02', userId: uPriya.id, shareAmount: 160000, user: uPriya },
        { id: 'ep_8', expenseId: 'exp_02', userId: uKarthik.id, shareAmount: 160000, user: uKarthik },
      ],
      createdAt: '2026-03-21T22:00:00.000Z',
      updatedAt: '2026-03-21T22:00:00.000Z',
    };

    // SUV Rental & Fuel: ₹8,800 paid by Priya
    const e3: Expense = {
      id: 'exp_03',
      sphereId: sGoa.id,
      title: '7-Seater SUV Rental & Highway Fuel',
      amount: 880000,
      currency: 'INR',
      paidById: uPriya.id,
      paidBy: uPriya,
      date: '2026-03-22T10:00:00.000Z',
      category: 'Travel',
      description: 'Scorpio N automatic rental for 4 days plus fuel refills.',
      splitMethod: 'EQUAL',
      participants: [
        { id: 'ep_9', expenseId: 'exp_03', userId: uGopi.id, shareAmount: 220000, user: uGopi },
        { id: 'ep_10', expenseId: 'exp_03', userId: uSaro.id, shareAmount: 220000, user: uSaro },
        { id: 'ep_11', expenseId: 'exp_03', userId: uPriya.id, shareAmount: 220000, user: uPriya },
        { id: 'ep_12', expenseId: 'exp_03', userId: uKarthik.id, shareAmount: 220000, user: uKarthik },
      ],
      createdAt: '2026-03-22T10:30:00.000Z',
      updatedAt: '2026-03-22T10:30:00.000Z',
    };

    // Scuba Diving: ₹12,000 paid by Karthik
    const e4: Expense = {
      id: 'exp_04',
      sphereId: sGoa.id,
      title: 'Grand Island Scuba & Snorkel Passes',
      amount: 1200000,
      currency: 'INR',
      paidById: uKarthik.id,
      paidBy: uKarthik,
      date: '2026-03-23T11:00:00.000Z',
      category: 'Entertainment',
      description: 'PADI guided diving session with underwater 4K video recording.',
      splitMethod: 'EQUAL',
      participants: [
        { id: 'ep_13', expenseId: 'exp_04', userId: uGopi.id, shareAmount: 300000, user: uGopi },
        { id: 'ep_14', expenseId: 'exp_04', userId: uSaro.id, shareAmount: 300000, user: uSaro },
        { id: 'ep_15', expenseId: 'exp_04', userId: uPriya.id, shareAmount: 300000, user: uPriya },
        { id: 'ep_16', expenseId: 'exp_04', userId: uKarthik.id, shareAmount: 300000, user: uKarthik },
      ],
      createdAt: '2026-03-23T12:00:00.000Z',
      updatedAt: '2026-03-23T12:00:00.000Z',
    };

    // Breakfast: ₹2,400 paid by Gopi (uneven/percentage)
    const e5: Expense = {
      id: 'exp_05',
      sphereId: sGoa.id,
      title: 'Artisan Bakery Breakfast & Speciality Coffee',
      amount: 240000,
      currency: 'INR',
      paidById: uGopi.id,
      paidBy: uGopi,
      date: '2026-03-24T09:30:00.000Z',
      category: 'Food',
      description: 'Avocado toast, croissants, and cold brews.',
      splitMethod: 'EQUAL',
      participants: [
        { id: 'ep_17', expenseId: 'exp_05', userId: uGopi.id, shareAmount: 60000, user: uGopi },
        { id: 'ep_18', expenseId: 'exp_05', userId: uSaro.id, shareAmount: 60000, user: uSaro },
        { id: 'ep_19', expenseId: 'exp_05', userId: uPriya.id, shareAmount: 60000, user: uPriya },
        { id: 'ep_20', expenseId: 'exp_05', userId: uKarthik.id, shareAmount: 60000, user: uKarthik },
      ],
      createdAt: '2026-03-24T10:00:00.000Z',
      updatedAt: '2026-03-24T10:00:00.000Z',
    };

    [e1, e2, e3, e4, e5].forEach((e) => this.expenses.set(e.id, e));

    // 4. Seed Settlements
    // Saro sent ₹4,000 to Gopi
    const set1: Settlement = {
      id: 'stl_01',
      sphereId: sGoa.id,
      fromUserId: uSaro.id,
      toUserId: uGopi.id,
      amount: 400000,
      currency: 'INR',
      method: 'UPI',
      referenceId: 'UPI-REF-981247192',
      notes: 'Initial villa split settlement via Google Pay',
      settledAt: '2026-03-22T19:00:00.000Z',
      fromUser: uSaro,
      toUser: uGopi,
    };
    this.settlements.set(set1.id, set1);

    // 5. Seed Payment Requests
    const pr1: PaymentRequest = {
      id: 'pr_01',
      sphereId: sGoa.id,
      fromUserId: uPriya.id,
      toUserId: uKarthik.id,
      amount: 150000,
      currency: 'INR',
      note: 'Airport toll passes & extra luggage charges',
      status: 'PENDING',
      createdAt: '2026-03-25T14:00:00.000Z',
      updatedAt: '2026-03-25T14:00:00.000Z',
      fromUser: uPriya,
      toUser: uKarthik,
      sphereName: sGoa.name,
    };
    this.paymentRequests.set(pr1.id, pr1);

    // 6. Seed Notifications for Gopi
    const notifs: AppNotification[] = [
      {
        id: 'notif_01',
        userId: uGopi.id,
        type: 'SETTLEMENT',
        title: 'Settlement Received',
        message: 'Saro settled ₹4,000 via UPI.',
        read: false,
        createdAt: '2026-03-22T19:00:00.000Z',
      },
      {
        id: 'notif_02',
        userId: uGopi.id,
        type: 'EXPENSE',
        title: 'New Expense in Goa Retreat',
        message: 'Karthik added "Grand Island Scuba & Snorkel Passes" (₹12,000).',
        read: true,
        createdAt: '2026-03-23T12:00:00.000Z',
      },
      {
        id: 'notif_03',
        userId: uGopi.id,
        type: 'PAYMENT_REQUEST',
        title: 'Payment Request Pending',
        message: 'Priya requested ₹1,500 from Karthik for toll passes.',
        read: false,
        createdAt: '2026-03-25T14:05:00.000Z',
      },
    ];
    notifs.forEach((n) => this.notifications.set(n.id, n));

    // 7. Seed Audit Logs
    this.auditLogs.push(
      {
        id: 'aud_1',
        action: 'USER_REGISTERED',
        details: 'Gopi M registered as administrator.',
        userId: uGopi.id,
        userEmail: uGopi.email,
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        id: 'aud_2',
        action: 'SPHERE_CREATED',
        details: 'Created Money Sphere "Goa Coastal Retreat" with 4 members.',
        userId: uGopi.id,
        userEmail: uGopi.email,
        createdAt: '2026-02-01T10:00:00.000Z',
      },
      {
        id: 'aud_3',
        action: 'EXPENSE_RECORDED',
        details: 'Added ₹32,000 for Heritage Beach Villa.',
        userId: uGopi.id,
        userEmail: uGopi.email,
        createdAt: '2026-03-20T15:30:00.000Z',
      }
    );
  }

  // Helper getters
  getUserByEmail(email: string): DbUser | undefined {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return undefined;
  }

  getUserById(id: string): User | undefined {
    const u = this.users.get(id);
    if (!u) return undefined;
    const { passwordHash, ...safeUser } = u;
    return safeUser;
  }

  getSpheresForUser(userId: string): MoneySphere[] {
    const list: MoneySphere[] = [];
    for (const s of this.spheres.values()) {
      const isMember = s.members.some((m) => m.userId === userId);
      if (isMember) {
        const expenses = this.getExpensesForSphere(s.id);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        list.push({
          ...s,
          expenseCount: expenses.length,
          totalSpent: total,
        });
      }
    }
    return list;
  }

  getExpensesForSphere(sphereId: string): Expense[] {
    return Array.from(this.expenses.values())
      .filter((e) => e.sphereId === sphereId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getSettlementsForSphere(sphereId: string): Settlement[] {
    return Array.from(this.settlements.values())
      .filter((s) => s.sphereId === sphereId)
      .sort((a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime());
  }

  logAudit(action: string, details: string, userId: string, userEmail?: string) {
    this.auditLogs.unshift({
      id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      details,
      userId,
      userEmail,
      createdAt: new Date().toISOString(),
    });
  }
}

export const db = new InMemoryDatabase();
