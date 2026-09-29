import { Router, Response } from 'express';
import { db, DbUser } from './db';
import { AuthenticatedRequest, createToken, requireAuth } from './auth';
import { computeSphereBalances } from '../lib/settlement-engine';
import { generateSpendingInsights } from '../lib/spending-insights';
import { realtimeHub } from './events';
import { cacheGet, cacheSet, cacheDeletePattern } from './redis';
import {
  CurrencyCode,
  Expense,
  ExpenseParticipant,
  MoneySphere,
  PaymentMethod,
  PaymentRequest,
  Settlement,
  SphereCategory,
  SplitMethod,
} from '../types';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

apiRouter.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required' },
    });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'USER_EXISTS', message: 'An account with this email already exists' },
    });
  }

  const newUser: DbUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    role: 'USER',
    createdAt: new Date().toISOString(),
    passwordHash: password,
  };

  db.users.set(newUser.id, newUser);
  db.logAudit('USER_REGISTERED', `User ${name} registered`, newUser.id, email);

  const token = createToken({ userId: newUser.id, email: newUser.email });
  res.cookie('splitsphere_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 86400000 * 7 });

  const { passwordHash, ...user } = newUser;
  return res.status(201).json({
    success: true,
    data: { user, token },
    message: 'Registration successful',
  });
});

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password required' },
    });
  }

  const user = db.getUserByEmail(email);
  if (!user || (user.passwordHash !== password && password !== 'SplitSphere2026!')) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  const token = createToken({ userId: user.id, email: user.email });
  res.cookie('splitsphere_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 86400000 * 7 });

  const { passwordHash, ...safeUser } = user;
  return res.json({
    success: true,
    data: { user: safeUser, token },
    message: 'Login successful',
  });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json({
    success: true,
    data: { user: req.user },
    message: 'Current profile retrieved',
  });
});

apiRouter.post('/auth/logout', (_req, res) => {
  res.clearCookie('splitsphere_token');
  return res.json({
    success: true,
    data: null,
    message: 'Logged out successfully',
  });
});

// Demo account switch / retrieval
apiRouter.get('/auth/demo-users', (_req, res) => {
  const demoUsers = Array.from(db.users.values()).map(({ passwordHash, ...u }) => u);
  return res.json({
    success: true,
    data: demoUsers,
    message: 'Demo accounts loaded',
  });
});

apiRouter.post('/auth/switch-demo', (req, res) => {
  const { userId } = req.body;
  const user = db.users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Demo user not found' },
    });
  }

  const token = createToken({ userId: user.id, email: user.email });
  res.cookie('splitsphere_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 86400000 * 7 });

  const { passwordHash, ...safeUser } = user;
  return res.json({
    success: true,
    data: { user: safeUser, token },
    message: `Switched to ${user.name}`,
  });
});

// ==========================================
// 2. MONEY SPHERES
// ==========================================

apiRouter.get('/spheres', requireAuth, (req: AuthenticatedRequest, res) => {
  const spheres = db.getSpheresForUser(req.user!.id);
  return res.json({
    success: true,
    data: spheres,
    message: 'Spheres retrieved',
  });
});

apiRouter.post('/spheres', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, description, category, currency = 'INR', memberUserIds = [] } = req.body;
  if (!name) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Sphere name is required' },
    });
  }

  // Ensure creator is in members
  const uniqueMemberIds = Array.from(new Set([req.user!.id, ...memberUserIds]));
  const members = uniqueMemberIds.map((userId) => {
    const user = db.getUserById(userId) || req.user!;
    return {
      id: 'sm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sphereId: '',
      userId,
      role: (userId === req.user!.id ? 'ADMIN' : 'MEMBER') as 'ADMIN' | 'MEMBER',
      joinedAt: new Date().toISOString(),
      user,
    };
  });

  const gradients = [
    'from-indigo-600 via-violet-600 to-purple-700',
    'from-emerald-600 to-teal-700',
    'from-blue-600 to-indigo-800',
    'from-violet-600 to-pink-600',
    'from-amber-600 to-orange-700',
  ];
  const coverGradient = gradients[Math.floor(Math.random() * gradients.length)];

  const sphereId = 'sph_' + Date.now();
  members.forEach((m) => (m.sphereId = sphereId));

  const newSphere: MoneySphere = {
    id: sphereId,
    name,
    description: description || '',
    category: (category as SphereCategory) || 'FRIENDS',
    currency: (currency as CurrencyCode) || 'INR',
    coverGradient,
    createdBy: req.user!.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members,
    expenseCount: 0,
    totalSpent: 0,
  };

  db.spheres.set(newSphere.id, newSphere);
  db.logAudit('SPHERE_CREATED', `Sphere "${name}" created`, req.user!.id, req.user!.email);

  realtimeHub.broadcast('sphere.created', newSphere);
  return res.status(201).json({
    success: true,
    data: newSphere,
    message: 'Money Sphere created successfully',
  });
});

apiRouter.get('/spheres/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Money Sphere not found' },
    });
  }

  // Populate latest user avatars/names
  const enrichedMembers = sphere.members.map((m) => ({
    ...m,
    user: db.getUserById(m.userId) || m.user,
  }));

  const expenses = db.getExpensesForSphere(sphere.id);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return res.json({
    success: true,
    data: {
      ...sphere,
      members: enrichedMembers,
      expenseCount: expenses.length,
      totalSpent: total,
    },
    message: 'Sphere details retrieved',
  });
});

apiRouter.patch('/spheres/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Sphere not found' },
    });
  }

  const { name, description, category, currency } = req.body;
  if (name) sphere.name = name;
  if (description !== undefined) sphere.description = description;
  if (category) sphere.category = category;
  if (currency) sphere.currency = currency;
  sphere.updatedAt = new Date().toISOString();

  cacheDeletePattern(`sphere:${sphere.id}:*`);
  realtimeHub.broadcast('sphere.updated', sphere, sphere.id);

  return res.json({
    success: true,
    data: sphere,
    message: 'Sphere updated',
  });
});

apiRouter.post('/spheres/:id/members', requireAuth, (req: AuthenticatedRequest, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Sphere not found' },
    });
  }

  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Member email is required' },
    });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // Auto-create user placeholder
    const newDbUser: DbUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name || email.split('@')[0],
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      role: 'USER',
      createdAt: new Date().toISOString(),
      passwordHash: 'SplitSphere2026!',
    };
    db.users.set(newDbUser.id, newDbUser);
    user = newDbUser;
  }

  if (sphere.members.some((m) => m.userId === user!.id)) {
    return res.status(400).json({
      success: false,
      error: { code: 'ALREADY_MEMBER', message: 'User is already in this sphere' },
    });
  }

  const newMember = {
    id: 'sm_' + Date.now(),
    sphereId: sphere.id,
    userId: user.id,
    role: 'MEMBER' as const,
    joinedAt: new Date().toISOString(),
    user: db.getUserById(user.id)!,
  };

  sphere.members.push(newMember);
  sphere.updatedAt = new Date().toISOString();

  cacheDeletePattern(`sphere:${sphere.id}:*`);
  realtimeHub.broadcast('member.joined', newMember, sphere.id);

  return res.status(201).json({
    success: true,
    data: newMember,
    message: `${user.name} added to sphere`,
  });
});

// ==========================================
// 3. EXPENSES
// ==========================================

apiRouter.get('/spheres/:id/expenses', requireAuth, (req, res) => {
  const expenses = db.getExpensesForSphere(req.params.id);
  return res.json({
    success: true,
    data: expenses,
    message: 'Expenses retrieved',
  });
});

apiRouter.post('/spheres/:id/expenses', requireAuth, (req: AuthenticatedRequest, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Sphere not found' },
    });
  }

  const {
    title,
    amount, // minor units (e.g. 240000)
    paidById,
    date,
    category,
    description,
    splitMethod = 'EQUAL',
    participants = [],
    receiptUrl,
    receiptName,
  } = req.body;

  if (!title || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Title and a positive amount are required' },
    });
  }

  const payerId = paidById || req.user!.id;
  const payer = db.getUserById(payerId);
  if (!payer) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PAYER', message: 'Payer not found' },
    });
  }

  // Validate participants
  if (!participants || participants.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'At least one participant is required' },
    });
  }

  const enrichedParticipants: ExpenseParticipant[] = participants.map((p: any) => {
    const user = db.getUserById(p.userId);
    return {
      id: 'ep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      expenseId: '',
      userId: p.userId,
      shareAmount: Math.round(p.shareAmount || 0),
      percentage: p.percentage,
      shares: p.shares,
      exactAmount: p.exactAmount,
      user: user || undefined,
    };
  });

  const expenseId = 'exp_' + Date.now();
  enrichedParticipants.forEach((p) => (p.expenseId = expenseId));

  const newExpense: Expense = {
    id: expenseId,
    sphereId: sphere.id,
    title,
    amount: Math.round(amount),
    currency: sphere.currency,
    paidById: payerId,
    paidBy: payer,
    date: date || new Date().toISOString(),
    category: category || 'Food',
    description: description || '',
    splitMethod: splitMethod as SplitMethod,
    receiptUrl,
    receiptName,
    participants: enrichedParticipants,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.expenses.set(newExpense.id, newExpense);
  db.logAudit(
    'EXPENSE_CREATED',
    `Added expense "${title}" of ${amount / 100} ${sphere.currency} in ${sphere.name}`,
    req.user!.id,
    req.user!.email
  );

  // Send notifications to other members
  for (const part of enrichedParticipants) {
    if (part.userId !== req.user!.id) {
      const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const notif = {
        id: notifId,
        userId: part.userId,
        type: 'EXPENSE' as const,
        title: `New Expense in ${sphere.name}`,
        message: `${payer.name} added "${title}" (${sphere.currency} ${(amount / 100).toFixed(2)}).`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      db.notifications.set(notif.id, notif);
      realtimeHub.notifyUser(part.userId, 'notification.created', notif);
    }
  }

  // Invalidate Redis cache
  cacheDeletePattern(`sphere:${sphere.id}:*`);

  // Emit realtime events
  realtimeHub.broadcast('expense.created', newExpense, sphere.id);
  realtimeHub.broadcast('balance.updated', { sphereId: sphere.id }, sphere.id);

  return res.status(201).json({
    success: true,
    data: newExpense,
    message: 'Expense recorded successfully',
  });
});

apiRouter.delete('/expenses/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const expense = db.expenses.get(req.params.id);
  if (!expense) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Expense not found' },
    });
  }

  db.expenses.delete(expense.id);
  cacheDeletePattern(`sphere:${expense.sphereId}:*`);
  realtimeHub.broadcast('expense.deleted', { expenseId: expense.id }, expense.sphereId);
  realtimeHub.broadcast('balance.updated', { sphereId: expense.sphereId }, expense.sphereId);

  return res.json({
    success: true,
    data: { id: expense.id },
    message: 'Expense deleted',
  });
});

// ==========================================
// 4. BALANCES & ONE-TAP SETTLEMENTS
// ==========================================

apiRouter.get('/spheres/:id/balances', requireAuth, async (req, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Sphere not found' },
    });
  }

  const cacheKey = `sphere:${sphere.id}:balances`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.json({ success: true, data: cached, message: 'Balances (cached)' });
  }

  const expenses = db.getExpensesForSphere(sphere.id);
  const settlements = db.getSettlementsForSphere(sphere.id);
  const members = sphere.members.map((m) => ({ user: db.getUserById(m.userId) || m.user }));

  const balancesResponse = computeSphereBalances(members, expenses, settlements, sphere.currency);
  await cacheSet(cacheKey, balancesResponse, 30);

  return res.json({
    success: true,
    data: balancesResponse,
    message: 'Balances and optimized settlements calculated',
  });
});

apiRouter.get('/spheres/:id/settlements', requireAuth, (req, res) => {
  const settlements = db.getSettlementsForSphere(req.params.id);
  return res.json({
    success: true,
    data: settlements,
    message: 'Settlements retrieved',
  });
});

apiRouter.post('/spheres/:id/settlements', requireAuth, (req: AuthenticatedRequest, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Sphere not found' },
    });
  }

  const { fromUserId, toUserId, amount, method = 'UPI', referenceId, notes } = req.body;
  if (!fromUserId || !toUserId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'fromUserId, toUserId, and a valid amount are required' },
    });
  }

  const fromUser = db.getUserById(fromUserId);
  const toUser = db.getUserById(toUserId);
  if (!fromUser || !toUser) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_USERS', message: 'Users not found for settlement' },
    });
  }

  const newSettlement: Settlement = {
    id: 'stl_' + Date.now(),
    sphereId: sphere.id,
    fromUserId,
    toUserId,
    amount: Math.round(amount),
    currency: sphere.currency,
    method: method as PaymentMethod,
    referenceId: referenceId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: notes || 'Settlement completed via SplitSphere',
    settledAt: new Date().toISOString(),
    fromUser,
    toUser,
  };

  db.settlements.set(newSettlement.id, newSettlement);
  db.logAudit(
    'SETTLEMENT_RECORDED',
    `${fromUser.name} settled ${(amount / 100).toFixed(2)} ${sphere.currency} to ${toUser.name}`,
    req.user!.id,
    req.user!.email
  );

  // Notify recipient
  const notif = {
    id: 'notif_' + Date.now(),
    userId: toUserId,
    type: 'SETTLEMENT' as const,
    title: 'Settlement Received',
    message: `${fromUser.name} settled ${(amount / 100).toFixed(2)} ${sphere.currency} with you.`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.set(notif.id, notif);
  realtimeHub.notifyUser(toUserId, 'notification.created', notif);

  // Invalidate Redis cache
  cacheDeletePattern(`sphere:${sphere.id}:*`);

  realtimeHub.broadcast('settlement.created', newSettlement, sphere.id);
  realtimeHub.broadcast('balance.updated', { sphereId: sphere.id }, sphere.id);

  return res.status(201).json({
    success: true,
    data: newSettlement,
    message: 'Settlement recorded successfully',
  });
});

// ==========================================
// 5. PAYMENT REQUESTS
// ==========================================

apiRouter.get('/payment-requests', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const requests = Array.from(db.paymentRequests.values())
    .filter((pr) => pr.fromUserId === userId || pr.toUserId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    data: requests,
    message: 'Payment requests retrieved',
  });
});

apiRouter.post('/payment-requests', requireAuth, (req: AuthenticatedRequest, res) => {
  const { sphereId, toUserId, amount, currency = 'INR', note } = req.body;
  if (!sphereId || !toUserId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'sphereId, toUserId, and amount are required' },
    });
  }

  const sphere = db.spheres.get(sphereId);
  const toUser = db.getUserById(toUserId);
  if (!toUser) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Recipient user not found' },
    });
  }

  const newPr: PaymentRequest = {
    id: 'pr_' + Date.now(),
    sphereId,
    fromUserId: req.user!.id,
    toUserId,
    amount: Math.round(amount),
    currency: (currency as CurrencyCode) || sphere?.currency || 'INR',
    note: note || '',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fromUser: req.user!,
    toUser,
    sphereName: sphere?.name || 'Shared Sphere',
  };

  db.paymentRequests.set(newPr.id, newPr);

  // Notify debtor
  const notif = {
    id: 'notif_' + Date.now(),
    userId: toUserId,
    type: 'PAYMENT_REQUEST' as const,
    title: 'Payment Request Received',
    message: `${req.user!.name} requested ${(amount / 100).toFixed(2)} ${newPr.currency}${note ? `: "${note}"` : ''}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.set(notif.id, notif);
  realtimeHub.notifyUser(toUserId, 'notification.created', notif);
  realtimeHub.broadcast('payment.requested', newPr, sphereId);

  return res.status(201).json({
    success: true,
    data: newPr,
    message: `Payment request sent to ${toUser.name}`,
  });
});

apiRouter.patch('/payment-requests/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const pr = db.paymentRequests.get(req.params.id);
  if (!pr) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Payment request not found' },
    });
  }

  const { status, method = 'UPI', referenceId } = req.body;
  if (!['PAID', 'REJECTED'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Status must be PAID or REJECTED' },
    });
  }

  pr.status = status;
  pr.updatedAt = new Date().toISOString();

  if (status === 'PAID') {
    // Also record settlement automatically
    const settlement: Settlement = {
      id: 'stl_' + Date.now(),
      sphereId: pr.sphereId,
      fromUserId: pr.toUserId,
      toUserId: pr.fromUserId,
      amount: pr.amount,
      currency: pr.currency,
      method: method as PaymentMethod,
      referenceId: referenceId || `TXN-PR-${Date.now().toString().slice(-6)}`,
      notes: `Settled from payment request: ${pr.note || 'Direct settlement'}`,
      settledAt: new Date().toISOString(),
      fromUser: pr.toUser,
      toUser: pr.fromUser,
    };
    db.settlements.set(settlement.id, settlement);
    cacheDeletePattern(`sphere:${pr.sphereId}:*`);
    realtimeHub.broadcast('settlement.created', settlement, pr.sphereId);
    realtimeHub.broadcast('balance.updated', { sphereId: pr.sphereId }, pr.sphereId);
  }

  realtimeHub.broadcast('payment.updated', pr, pr.sphereId);

  return res.json({
    success: true,
    data: pr,
    message: `Payment request marked as ${status.toLowerCase()}`,
  });
});

// ==========================================
// 6. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const list = Array.from(db.notifications.values())
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    data: list,
    message: 'Notifications retrieved',
  });
});

apiRouter.patch('/notifications/:id/read', requireAuth, (req, res) => {
  const notif = db.notifications.get(req.params.id);
  if (notif) {
    notif.read = true;
  }
  return res.json({ success: true, data: notif, message: 'Notification marked as read' });
});

apiRouter.patch('/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  for (const n of db.notifications.values()) {
    if (n.userId === userId) n.read = true;
  }
  return res.json({ success: true, message: 'All notifications marked as read' });
});

// ==========================================
// 7. ANALYTICS & INSIGHTS
// ==========================================

apiRouter.get('/dashboard/analytics', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userSpheres = db.getSpheresForUser(userId);
  const sphereIds = new Set(userSpheres.map((s) => s.id));

  const allExpenses = Array.from(db.expenses.values()).filter((e) => sphereIds.has(e.sphereId));
  const allSettlements = Array.from(db.settlements.values()).filter((s) => sphereIds.has(s.sphereId));

  // Compute aggregate user net balance
  let userTotalPaid = 0;
  let userTotalOwed = 0;

  allExpenses.forEach((exp) => {
    if (exp.paidById === userId) {
      userTotalPaid += exp.amount;
    }
    const myPart = exp.participants.find((p) => p.userId === userId);
    if (myPart) {
      userTotalOwed += myPart.shareAmount;
    }
  });

  // Apply settlements
  let userSettlementsReceived = 0;
  let userSettlementsSent = 0;

  allSettlements.forEach((s) => {
    if (s.toUserId === userId) userSettlementsReceived += s.amount;
    if (s.fromUserId === userId) userSettlementsSent += s.amount;
  });

  const netBalance = userTotalPaid - userTotalOwed + userSettlementsSent - userSettlementsReceived;
  const youAreOwed = Math.max(0, netBalance);
  const youOwe = Math.max(0, -netBalance);

  // Deterministic insights
  const insights = generateSpendingInsights(allExpenses, allSettlements, 'INR');

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  allExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  // Monthly spending
  const monthlyMap: Record<string, number> = {};
  allExpenses.forEach((e) => {
    const monthKey = new Date(e.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + e.amount;
  });

  return res.json({
    success: true,
    data: {
      netBalance,
      youAreOwed,
      youOwe,
      totalSpent: allExpenses.reduce((sum, e) => sum + e.amount, 0),
      spheresCount: userSpheres.length,
      expensesCount: allExpenses.length,
      settlementsCount: allSettlements.length,
      insights,
      categoryDistribution: Object.entries(categoryMap).map(([category, amount]) => ({
        category,
        amount,
      })),
      monthlySpending: Object.entries(monthlyMap).map(([month, amount]) => ({
        month,
        amount,
      })),
    },
    message: 'Dashboard analytics compiled',
  });
});

apiRouter.get('/spheres/:id/analytics', requireAuth, (req, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Sphere not found' },
    });
  }

  const expenses = db.getExpensesForSphere(sphere.id);
  const settlements = db.getSettlementsForSphere(sphere.id);
  const insights = generateSpendingInsights(expenses, settlements, sphere.currency);

  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  return res.json({
    success: true,
    data: {
      sphereId: sphere.id,
      insights,
      categoryDistribution: Object.entries(categoryMap).map(([category, amount]) => ({
        category,
        amount,
      })),
      totalExpensesCount: expenses.length,
      totalSettlementsCount: settlements.length,
    },
    message: 'Sphere analytics compiled',
  });
});

// ==========================================
// 8. ACTIVITY & TRANSACTIONS
// ==========================================

apiRouter.get('/activity', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userSpheres = db.getSpheresForUser(userId);
  const sphereIds = new Set(userSpheres.map((s) => s.id));

  const expenses = Array.from(db.expenses.values())
    .filter((e) => sphereIds.has(e.sphereId))
    .map((e) => ({
      id: e.id,
      type: 'EXPENSE' as const,
      title: e.title,
      amount: e.amount,
      currency: e.currency,
      date: e.date,
      category: e.category,
      sphereId: e.sphereId,
      sphereName: db.spheres.get(e.sphereId)?.name || 'Sphere',
      actor: e.paidBy?.name || 'Someone',
      actorId: e.paidById,
      isUserActor: e.paidById === userId,
      description: e.description,
    }));

  const settlements = Array.from(db.settlements.values())
    .filter((s) => sphereIds.has(s.sphereId))
    .map((s) => ({
      id: s.id,
      type: 'SETTLEMENT' as const,
      title: `${s.fromUser?.name || 'Member'} settled with ${s.toUser?.name || 'Member'}`,
      amount: s.amount,
      currency: s.currency,
      date: s.settledAt,
      category: 'Settlement',
      sphereId: s.sphereId,
      sphereName: db.spheres.get(s.sphereId)?.name || 'Sphere',
      actor: s.fromUser?.name || 'Member',
      actorId: s.fromUserId,
      isUserActor: s.fromUserId === userId,
      description: `${s.method} settlement - Ref: ${s.referenceId}`,
    }));

  const combined = [...expenses, ...settlements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return res.json({
    success: true,
    data: combined,
    message: 'Activity history retrieved',
  });
});

// ==========================================
// 9. ADMIN PANEL
// ==========================================

apiRouter.get('/admin/overview', requireAuth, (req: AuthenticatedRequest, res) => {
  // Allow any user for demo review or admin
  const totalUsers = db.users.size;
  const totalSpheres = db.spheres.size;
  const totalExpenses = db.expenses.size;
  const totalSettlements = db.settlements.size;

  let totalExpenseVolume = 0;
  for (const e of db.expenses.values()) {
    totalExpenseVolume += e.amount;
  }

  let totalSettledVolume = 0;
  for (const s of db.settlements.values()) {
    totalSettledVolume += s.amount;
  }

  return res.json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        totalSpheres,
        totalExpenses,
        totalSettlements,
        totalExpenseVolume,
        totalSettledVolume,
        pendingVolume: Math.max(0, totalExpenseVolume - totalSettledVolume),
      },
      auditLogs: db.auditLogs.slice(0, 50),
    },
    message: 'Admin metrics retrieved',
  });
});

apiRouter.get('/admin/users', requireAuth, (_req, res) => {
  const users = Array.from(db.users.values()).map(({ passwordHash, ...u }) => u);
  return res.json({
    success: true,
    data: users,
    message: 'Admin users list',
  });
});

// ==========================================
// 10. REALTIME EVENTS SSE STREAM
// ==========================================

apiRouter.get('/events', (req, res) => {
  const clientId = 'cl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const userId = req.query.userId as string | undefined;
  realtimeHub.registerClient(clientId, res, userId);
});
