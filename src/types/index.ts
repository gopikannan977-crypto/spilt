export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export type SplitMethod = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';

export type SphereCategory = 
  | 'TRAVEL'
  | 'FRIENDS'
  | 'APARTMENT'
  | 'OFFICE'
  | 'FAMILY'
  | 'EVENT'
  | 'PROJECT'
  | 'OTHER';

export interface SphereMember {
  id: string;
  sphereId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: User;
}

export interface MoneySphere {
  id: string;
  name: string;
  description: string;
  category: SphereCategory;
  currency: CurrencyCode;
  coverGradient: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: SphereMember[];
  expenseCount?: number;
  totalSpent?: number; // minor units (paise/cents)
}

export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Rent'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Education'
  | 'Medical'
  | 'Other';

export interface ExpenseParticipant {
  id: string;
  expenseId: string;
  userId: string;
  shareAmount: number; // minor units
  percentage?: number;
  shares?: number;
  exactAmount?: number;
  user?: User;
}

export interface Expense {
  id: string;
  sphereId: string;
  title: string;
  amount: number; // minor units (e.g. 240000 = 2400.00)
  currency: CurrencyCode;
  paidById: string;
  paidBy: User;
  date: string;
  category: ExpenseCategory;
  description?: string;
  splitMethod: SplitMethod;
  receiptUrl?: string;
  receiptName?: string;
  participants: ExpenseParticipant[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';

export interface Settlement {
  id: string;
  sphereId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // minor units
  currency: CurrencyCode;
  method: PaymentMethod;
  referenceId?: string;
  notes?: string;
  settledAt: string;
  fromUser?: User;
  toUser?: User;
}

export type PaymentRequestStatus = 'PENDING' | 'PAID' | 'REJECTED';

export interface PaymentRequest {
  id: string;
  sphereId: string;
  fromUserId: string; // The person asking for money (creditor)
  toUserId: string;   // The person who owes (debtor)
  amount: number;     // minor units
  currency: CurrencyCode;
  note?: string;
  status: PaymentRequestStatus;
  createdAt: string;
  updatedAt: string;
  fromUser?: User;
  toUser?: User;
  sphereName?: string;
}

export type NotificationType =
  | 'EXPENSE'
  | 'PAYMENT_REQUEST'
  | 'SETTLEMENT'
  | 'INVITATION'
  | 'REMINDER';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  userEmail?: string;
  createdAt: string;
}

export interface SimplifiedTransaction {
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  toUser: User;
  amount: number; // minor units
  currency: CurrencyCode;
}

export interface MemberBalance {
  userId: string;
  user: User;
  netBalance: number; // positive = owed money, negative = owes money
  totalPaid: number;
  totalOwed: number;
}

export interface SphereBalancesResponse {
  sphereId: string;
  currency: CurrencyCode;
  totalSpent: number;
  pendingSettlementsAmount: number;
  settledAmount: number;
  memberBalances: MemberBalance[];
  optimizedSettlements: SimplifiedTransaction[];
  healthScore: {
    score: number; // 0 - 100
    status: 'Healthy' | 'Needs Attention' | 'High Pending';
    explanation: string;
    settledRatio: number;
    unresolvedCount: number;
    oldestPendingDays: number;
  };
}

export interface SplitSenseAnalysis {
  type: 'EQUAL' | 'UNEVEN' | 'SINGLE_COVERAGE' | 'CUSTOM';
  headline: string;
  details: string[];
  suggestedAction: string;
}

export interface DeterministicInsight {
  id: string;
  type: 'spending' | 'settlement' | 'category' | 'comparison';
  title: string;
  description: string;
  metric?: string;
}
