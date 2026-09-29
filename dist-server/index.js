// src/server/entry.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// src/server/routes.ts
import { Router } from "express";

// src/server/db.ts
var InMemoryDatabase = class {
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.spheres = /* @__PURE__ */ new Map();
    this.expenses = /* @__PURE__ */ new Map();
    this.settlements = /* @__PURE__ */ new Map();
    this.paymentRequests = /* @__PURE__ */ new Map();
    this.notifications = /* @__PURE__ */ new Map();
    this.auditLogs = [];
    this.seed();
  }
  seed() {
    const uGopi = {
      id: "usr_gopi_001",
      name: "Gopi M",
      email: "gopi@example.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "ADMIN",
      createdAt: "2026-01-10T08:00:00.000Z",
      passwordHash: "SplitSphere2026!"
      // In production bcrypt hash; dev simplified
    };
    const uSaro = {
      id: "usr_saro_002",
      name: "Saro",
      email: "saro@example.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "USER",
      createdAt: "2026-01-11T09:30:00.000Z",
      passwordHash: "SplitSphere2026!"
    };
    const uPriya = {
      id: "usr_priya_003",
      name: "Priya Sharma",
      email: "priya@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role: "USER",
      createdAt: "2026-01-12T11:15:00.000Z",
      passwordHash: "SplitSphere2026!"
    };
    const uKarthik = {
      id: "usr_karthik_004",
      name: "Karthik R",
      email: "karthik@example.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      role: "USER",
      createdAt: "2026-01-14T14:45:00.000Z",
      passwordHash: "SplitSphere2026!"
    };
    [uGopi, uSaro, uPriya, uKarthik].forEach((u) => this.users.set(u.id, u));
    const sGoa = {
      id: "sph_goa_01",
      name: "Goa Coastal Retreat",
      description: "Beach villa rental, seaside meals, watersports, and shared scooter fuel.",
      category: "TRAVEL",
      currency: "INR",
      coverGradient: "from-indigo-600 via-violet-600 to-purple-700",
      createdBy: uGopi.id,
      createdAt: "2026-02-01T10:00:00.000Z",
      updatedAt: "2026-03-28T16:00:00.000Z",
      members: [
        { id: "sm_1", sphereId: "sph_goa_01", userId: uGopi.id, role: "ADMIN", joinedAt: "2026-02-01T10:00:00.000Z", user: uGopi },
        { id: "sm_2", sphereId: "sph_goa_01", userId: uSaro.id, role: "MEMBER", joinedAt: "2026-02-01T10:15:00.000Z", user: uSaro },
        { id: "sm_3", sphereId: "sph_goa_01", userId: uPriya.id, role: "MEMBER", joinedAt: "2026-02-01T10:20:00.000Z", user: uPriya },
        { id: "sm_4", sphereId: "sph_goa_01", userId: uKarthik.id, role: "MEMBER", joinedAt: "2026-02-01T10:30:00.000Z", user: uKarthik }
      ]
    };
    const sApt = {
      id: "sph_apt_02",
      name: "Apartment 402 Shared Living",
      description: "Monthly fiber broadband, groceries, deep cleaning, and utility bills.",
      category: "APARTMENT",
      currency: "INR",
      coverGradient: "from-emerald-600 to-teal-700",
      createdBy: uSaro.id,
      createdAt: "2026-01-15T09:00:00.000Z",
      updatedAt: "2026-03-25T11:00:00.000Z",
      members: [
        { id: "sm_5", sphereId: "sph_apt_02", userId: uGopi.id, role: "MEMBER", joinedAt: "2026-01-15T09:05:00.000Z", user: uGopi },
        { id: "sm_6", sphereId: "sph_apt_02", userId: uSaro.id, role: "ADMIN", joinedAt: "2026-01-15T09:00:00.000Z", user: uSaro },
        { id: "sm_7", sphereId: "sph_apt_02", userId: uPriya.id, role: "MEMBER", joinedAt: "2026-01-15T09:10:00.000Z", user: uPriya }
      ]
    };
    const sOffice = {
      id: "sph_office_03",
      name: "Office Lunch & Coffee Club",
      description: "Weekday group orders, coffee runs, and team celebration snacks.",
      category: "OFFICE",
      currency: "INR",
      coverGradient: "from-blue-600 to-indigo-800",
      createdBy: uGopi.id,
      createdAt: "2026-02-20T12:00:00.000Z",
      updatedAt: "2026-03-27T14:00:00.000Z",
      members: [
        { id: "sm_8", sphereId: "sph_office_03", userId: uGopi.id, role: "ADMIN", joinedAt: "2026-02-20T12:00:00.000Z", user: uGopi },
        { id: "sm_9", sphereId: "sph_office_03", userId: uSaro.id, role: "MEMBER", joinedAt: "2026-02-20T12:05:00.000Z", user: uSaro },
        { id: "sm_10", sphereId: "sph_office_03", userId: uPriya.id, role: "MEMBER", joinedAt: "2026-02-20T12:10:00.000Z", user: uPriya }
      ]
    };
    [sGoa, sApt, sOffice].forEach((s) => this.spheres.set(s.id, s));
    const e1 = {
      id: "exp_01",
      sphereId: sGoa.id,
      title: "Heritage Beach Villa (3 Nights)",
      amount: 32e5,
      currency: "INR",
      paidById: uGopi.id,
      paidBy: uGopi,
      date: "2026-03-20T15:00:00.000Z",
      category: "Travel",
      description: "Private 3-bedroom Portuguese villa facing Anjuna beach with swimming pool.",
      splitMethod: "EQUAL",
      participants: [
        { id: "ep_1", expenseId: "exp_01", userId: uGopi.id, shareAmount: 8e5, user: uGopi },
        { id: "ep_2", expenseId: "exp_01", userId: uSaro.id, shareAmount: 8e5, user: uSaro },
        { id: "ep_3", expenseId: "exp_01", userId: uPriya.id, shareAmount: 8e5, user: uPriya },
        { id: "ep_4", expenseId: "exp_01", userId: uKarthik.id, shareAmount: 8e5, user: uKarthik }
      ],
      createdAt: "2026-03-20T15:30:00.000Z",
      updatedAt: "2026-03-20T15:30:00.000Z"
    };
    const e2 = {
      id: "exp_02",
      sphereId: sGoa.id,
      title: "Candolim Sunset Dinner & Seafood",
      amount: 64e4,
      currency: "INR",
      paidById: uSaro.id,
      paidBy: uSaro,
      date: "2026-03-21T21:00:00.000Z",
      category: "Food",
      description: "Fresh butter garlic prawns, Kingfish curry, sourdough garlic bread, drinks.",
      splitMethod: "EQUAL",
      participants: [
        { id: "ep_5", expenseId: "exp_02", userId: uGopi.id, shareAmount: 16e4, user: uGopi },
        { id: "ep_6", expenseId: "exp_02", userId: uSaro.id, shareAmount: 16e4, user: uSaro },
        { id: "ep_7", expenseId: "exp_02", userId: uPriya.id, shareAmount: 16e4, user: uPriya },
        { id: "ep_8", expenseId: "exp_02", userId: uKarthik.id, shareAmount: 16e4, user: uKarthik }
      ],
      createdAt: "2026-03-21T22:00:00.000Z",
      updatedAt: "2026-03-21T22:00:00.000Z"
    };
    const e3 = {
      id: "exp_03",
      sphereId: sGoa.id,
      title: "7-Seater SUV Rental & Highway Fuel",
      amount: 88e4,
      currency: "INR",
      paidById: uPriya.id,
      paidBy: uPriya,
      date: "2026-03-22T10:00:00.000Z",
      category: "Travel",
      description: "Scorpio N automatic rental for 4 days plus fuel refills.",
      splitMethod: "EQUAL",
      participants: [
        { id: "ep_9", expenseId: "exp_03", userId: uGopi.id, shareAmount: 22e4, user: uGopi },
        { id: "ep_10", expenseId: "exp_03", userId: uSaro.id, shareAmount: 22e4, user: uSaro },
        { id: "ep_11", expenseId: "exp_03", userId: uPriya.id, shareAmount: 22e4, user: uPriya },
        { id: "ep_12", expenseId: "exp_03", userId: uKarthik.id, shareAmount: 22e4, user: uKarthik }
      ],
      createdAt: "2026-03-22T10:30:00.000Z",
      updatedAt: "2026-03-22T10:30:00.000Z"
    };
    const e4 = {
      id: "exp_04",
      sphereId: sGoa.id,
      title: "Grand Island Scuba & Snorkel Passes",
      amount: 12e5,
      currency: "INR",
      paidById: uKarthik.id,
      paidBy: uKarthik,
      date: "2026-03-23T11:00:00.000Z",
      category: "Entertainment",
      description: "PADI guided diving session with underwater 4K video recording.",
      splitMethod: "EQUAL",
      participants: [
        { id: "ep_13", expenseId: "exp_04", userId: uGopi.id, shareAmount: 3e5, user: uGopi },
        { id: "ep_14", expenseId: "exp_04", userId: uSaro.id, shareAmount: 3e5, user: uSaro },
        { id: "ep_15", expenseId: "exp_04", userId: uPriya.id, shareAmount: 3e5, user: uPriya },
        { id: "ep_16", expenseId: "exp_04", userId: uKarthik.id, shareAmount: 3e5, user: uKarthik }
      ],
      createdAt: "2026-03-23T12:00:00.000Z",
      updatedAt: "2026-03-23T12:00:00.000Z"
    };
    const e5 = {
      id: "exp_05",
      sphereId: sGoa.id,
      title: "Artisan Bakery Breakfast & Speciality Coffee",
      amount: 24e4,
      currency: "INR",
      paidById: uGopi.id,
      paidBy: uGopi,
      date: "2026-03-24T09:30:00.000Z",
      category: "Food",
      description: "Avocado toast, croissants, and cold brews.",
      splitMethod: "EQUAL",
      participants: [
        { id: "ep_17", expenseId: "exp_05", userId: uGopi.id, shareAmount: 6e4, user: uGopi },
        { id: "ep_18", expenseId: "exp_05", userId: uSaro.id, shareAmount: 6e4, user: uSaro },
        { id: "ep_19", expenseId: "exp_05", userId: uPriya.id, shareAmount: 6e4, user: uPriya },
        { id: "ep_20", expenseId: "exp_05", userId: uKarthik.id, shareAmount: 6e4, user: uKarthik }
      ],
      createdAt: "2026-03-24T10:00:00.000Z",
      updatedAt: "2026-03-24T10:00:00.000Z"
    };
    [e1, e2, e3, e4, e5].forEach((e) => this.expenses.set(e.id, e));
    const set1 = {
      id: "stl_01",
      sphereId: sGoa.id,
      fromUserId: uSaro.id,
      toUserId: uGopi.id,
      amount: 4e5,
      currency: "INR",
      method: "UPI",
      referenceId: "UPI-REF-981247192",
      notes: "Initial villa split settlement via Google Pay",
      settledAt: "2026-03-22T19:00:00.000Z",
      fromUser: uSaro,
      toUser: uGopi
    };
    this.settlements.set(set1.id, set1);
    const pr1 = {
      id: "pr_01",
      sphereId: sGoa.id,
      fromUserId: uPriya.id,
      toUserId: uKarthik.id,
      amount: 15e4,
      currency: "INR",
      note: "Airport toll passes & extra luggage charges",
      status: "PENDING",
      createdAt: "2026-03-25T14:00:00.000Z",
      updatedAt: "2026-03-25T14:00:00.000Z",
      fromUser: uPriya,
      toUser: uKarthik,
      sphereName: sGoa.name
    };
    this.paymentRequests.set(pr1.id, pr1);
    const notifs = [
      {
        id: "notif_01",
        userId: uGopi.id,
        type: "SETTLEMENT",
        title: "Settlement Received",
        message: "Saro settled \u20B94,000 via UPI.",
        read: false,
        createdAt: "2026-03-22T19:00:00.000Z"
      },
      {
        id: "notif_02",
        userId: uGopi.id,
        type: "EXPENSE",
        title: "New Expense in Goa Retreat",
        message: 'Karthik added "Grand Island Scuba & Snorkel Passes" (\u20B912,000).',
        read: true,
        createdAt: "2026-03-23T12:00:00.000Z"
      },
      {
        id: "notif_03",
        userId: uGopi.id,
        type: "PAYMENT_REQUEST",
        title: "Payment Request Pending",
        message: "Priya requested \u20B91,500 from Karthik for toll passes.",
        read: false,
        createdAt: "2026-03-25T14:05:00.000Z"
      }
    ];
    notifs.forEach((n) => this.notifications.set(n.id, n));
    this.auditLogs.push(
      {
        id: "aud_1",
        action: "USER_REGISTERED",
        details: "Gopi M registered as administrator.",
        userId: uGopi.id,
        userEmail: uGopi.email,
        createdAt: "2026-01-10T08:00:00.000Z"
      },
      {
        id: "aud_2",
        action: "SPHERE_CREATED",
        details: 'Created Money Sphere "Goa Coastal Retreat" with 4 members.',
        userId: uGopi.id,
        userEmail: uGopi.email,
        createdAt: "2026-02-01T10:00:00.000Z"
      },
      {
        id: "aud_3",
        action: "EXPENSE_RECORDED",
        details: "Added \u20B932,000 for Heritage Beach Villa.",
        userId: uGopi.id,
        userEmail: uGopi.email,
        createdAt: "2026-03-20T15:30:00.000Z"
      }
    );
  }
  // Helper getters
  getUserByEmail(email) {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return void 0;
  }
  getUserById(id) {
    const u = this.users.get(id);
    if (!u) return void 0;
    const { passwordHash, ...safeUser } = u;
    return safeUser;
  }
  getSpheresForUser(userId) {
    const list = [];
    for (const s of this.spheres.values()) {
      const isMember = s.members.some((m) => m.userId === userId);
      if (isMember) {
        const expenses = this.getExpensesForSphere(s.id);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        list.push({
          ...s,
          expenseCount: expenses.length,
          totalSpent: total
        });
      }
    }
    return list;
  }
  getExpensesForSphere(sphereId) {
    return Array.from(this.expenses.values()).filter((e) => e.sphereId === sphereId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  getSettlementsForSphere(sphereId) {
    return Array.from(this.settlements.values()).filter((s) => s.sphereId === sphereId).sort((a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime());
  }
  logAudit(action, details, userId, userEmail) {
    this.auditLogs.unshift({
      id: "aud_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      action,
      details,
      userId,
      userEmail,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
};
var db = new InMemoryDatabase();

// src/server/auth.ts
import crypto from "crypto";
var JWT_SECRET = process.env.JWT_SECRET || "splitsphere-secret-key-32-chars-minimum-prod";
function createToken(payload, expiresInSeconds = 86400 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1e3) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
function verifyToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest("base64url");
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() / 1e3 > payload.exp) {
      return null;
    }
    return { userId: payload.userId, email: payload.email };
  } catch (err) {
    return null;
  }
}
function requireAuth(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.splitsphere_token) {
    token = req.cookies.splitsphere_token;
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" }
    });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Session expired or token invalid" }
    });
  }
  const user = db.getUserById(payload.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "User account not found" }
    });
  }
  req.user = user;
  next();
}

// src/lib/currency.ts
var CURRENCY_SYMBOLS = {
  INR: "\u20B9",
  USD: "$",
  EUR: "\u20AC",
  GBP: "\xA3",
  AED: "AED ",
  SGD: "S$"
};
function formatCurrency(amountMinor, currency = "INR", includeSymbol = true) {
  const isNegative = amountMinor < 0;
  const absAmount = Math.abs(amountMinor) / 100;
  const formattedNumber = absAmount.toLocaleString("en-IN", {
    minimumFractionDigits: absAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });
  const symbol = includeSymbol ? CURRENCY_SYMBOLS[currency] || "\u20B9" : "";
  if (isNegative) {
    return `-${symbol}${formattedNumber}`;
  }
  return `${symbol}${formattedNumber}`;
}

// src/lib/settlement-engine.ts
function computeSphereBalances(members, expenses, settlements, currency = "INR") {
  const userMap = /* @__PURE__ */ new Map();
  const totalPaidMap = /* @__PURE__ */ new Map();
  const totalOwedMap = /* @__PURE__ */ new Map();
  const netBalanceMap = /* @__PURE__ */ new Map();
  members.forEach((m) => {
    userMap.set(m.user.id, m.user);
    totalPaidMap.set(m.user.id, 0);
    totalOwedMap.set(m.user.id, 0);
    netBalanceMap.set(m.user.id, 0);
  });
  let totalSpent = 0;
  expenses.forEach((expense) => {
    totalSpent += expense.amount;
    const paidBy = expense.paidById;
    totalPaidMap.set(paidBy, (totalPaidMap.get(paidBy) || 0) + expense.amount);
    expense.participants.forEach((p) => {
      totalOwedMap.set(p.userId, (totalOwedMap.get(p.userId) || 0) + p.shareAmount);
    });
  });
  userMap.forEach((_, userId) => {
    const paid = totalPaidMap.get(userId) || 0;
    const owed = totalOwedMap.get(userId) || 0;
    netBalanceMap.set(userId, paid - owed);
  });
  let settledAmount = 0;
  settlements.forEach((s) => {
    settledAmount += s.amount;
    const fromBal = netBalanceMap.get(s.fromUserId) || 0;
    const toBal = netBalanceMap.get(s.toUserId) || 0;
    netBalanceMap.set(s.fromUserId, fromBal + s.amount);
    netBalanceMap.set(s.toUserId, toBal - s.amount);
  });
  const memberBalances = [];
  userMap.forEach((user, userId) => {
    memberBalances.push({
      userId,
      user,
      netBalance: netBalanceMap.get(userId) || 0,
      totalPaid: totalPaidMap.get(userId) || 0,
      totalOwed: totalOwedMap.get(userId) || 0
    });
  });
  const pendingSettlementsAmount = memberBalances.filter((b) => b.netBalance > 0).reduce((sum, b) => sum + b.netBalance, 0);
  const optimizedSettlements = simplifyDebts(memberBalances, currency);
  const healthScore = calculateSettlementHealth(expenses, settlements, memberBalances);
  return {
    sphereId: expenses[0]?.sphereId || "",
    currency,
    totalSpent,
    pendingSettlementsAmount,
    settledAmount,
    memberBalances,
    optimizedSettlements,
    healthScore
  };
}
function simplifyDebts(balances, currency = "INR") {
  const debtors = [];
  const creditors = [];
  balances.forEach((b) => {
    if (b.netBalance < -1) {
      debtors.push({ user: b.user, amount: -b.netBalance });
    } else if (b.netBalance > 1) {
      creditors.push({ user: b.user, amount: b.netBalance });
    }
  });
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settled = Math.min(debtor.amount, creditor.amount);
    if (settled > 0) {
      transactions.push({
        fromUserId: debtor.user.id,
        toUserId: creditor.user.id,
        fromUser: debtor.user,
        toUser: creditor.user,
        amount: settled,
        currency
      });
    }
    debtor.amount -= settled;
    creditor.amount -= settled;
    if (debtor.amount <= 1) {
      dIdx++;
    }
    if (creditor.amount <= 1) {
      cIdx++;
    }
  }
  return transactions;
}
function calculateSettlementHealth(expenses, settlements, balances) {
  const totalVolume = expenses.reduce((sum, e) => sum + e.amount, 0);
  const settledVolume = settlements.reduce((sum, s) => sum + s.amount, 0);
  const pendingDebtors = balances.filter((b) => b.netBalance < -50);
  const unresolvedCount = pendingDebtors.length;
  if (totalVolume === 0) {
    return {
      score: 100,
      status: "Healthy",
      explanation: "No pending debts. All shared accounts are balanced.",
      settledRatio: 1,
      unresolvedCount: 0,
      oldestPendingDays: 0
    };
  }
  let oldestPendingDays = 0;
  if (unresolvedCount > 0 && expenses.length > 0) {
    const sortedExpenses = [...expenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const oldest = sortedExpenses[0];
    const diffMs = Math.max(0, Date.now() - new Date(oldest.date).getTime());
    oldestPendingDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
  }
  const pendingVolume = balances.filter((b) => b.netBalance > 0).reduce((sum, b) => sum + b.netBalance, 0);
  const pendingRatio = totalVolume > 0 ? pendingVolume / totalVolume : 0;
  let score = 100;
  score -= Math.min(40, Math.round(pendingRatio * 40));
  if (oldestPendingDays > 30) {
    score -= 25;
  } else if (oldestPendingDays > 14) {
    score -= 15;
  } else if (oldestPendingDays > 7) {
    score -= 8;
  }
  score -= Math.min(20, unresolvedCount * 5);
  score = Math.max(10, Math.min(100, score));
  let status = "Healthy";
  let explanation = "";
  if (score >= 85) {
    status = "Healthy";
    explanation = `${balances.filter((b) => b.netBalance === 0).length} members balanced. Fast turnaround with minimal outstanding balance.`;
  } else if (score >= 60) {
    status = "Needs Attention";
    explanation = `${unresolvedCount} members have unsettled balances pending for ~${oldestPendingDays} days.`;
  } else {
    status = "High Pending";
    explanation = `High outstanding debt volume relative to group spending. Prompt settlements recommended.`;
  }
  return {
    score,
    status,
    explanation,
    settledRatio: totalVolume > 0 ? settledVolume / totalVolume : 1,
    unresolvedCount,
    oldestPendingDays
  };
}

// src/lib/spending-insights.ts
function generateSpendingInsights(expenses, settlements, currency = "INR") {
  if (expenses.length === 0) {
    return [
      {
        id: "no-expenses",
        type: "spending",
        title: "Fresh Financial Orbit",
        description: "No shared expenses recorded yet. Create an expense to unlock real-time spending insights."
      }
    ];
  }
  const insights = [];
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0) {
    const [topCat, topAmount] = sortedCategories[0];
    const percentage = Math.round(topAmount / totalSpend * 100);
    insights.push({
      id: "top-category",
      type: "category",
      title: `${topCat} is your largest shared expense`,
      description: `Accounting for ${percentage}% (${formatCurrency(topAmount, currency)}) of overall group expenses.`,
      metric: `${percentage}%`
    });
  }
  const avgExpense = Math.round(totalSpend / expenses.length);
  const sortedByAmount = [...expenses].sort((a, b) => b.amount - a.amount);
  const largest = sortedByAmount[0];
  insights.push({
    id: "average-size",
    type: "spending",
    title: "Average Transaction Velocity",
    description: `Across ${expenses.length} group expenses, your mean transaction size is ${formatCurrency(avgExpense, currency)}. Largest single expense was "${largest.title}" at ${formatCurrency(largest.amount, currency)}.`,
    metric: formatCurrency(avgExpense, currency)
  });
  const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
  if (totalSettled > 0) {
    const settleRatio = Math.min(100, Math.round(totalSettled / totalSpend * 100));
    insights.push({
      id: "settlement-progress",
      type: "settlement",
      title: "Settlement Resolution Velocity",
      description: `${formatCurrency(totalSettled, currency)} has been settled through ${settlements.length} verified transfers (${settleRatio}% of active obligations cleared).`,
      metric: `${settleRatio}% cleared`
    });
  } else {
    insights.push({
      id: "settlement-pending",
      type: "settlement",
      title: "Pending Settlement Pool",
      description: "Zero manual settlements recorded yet. Use One-Tap Simplify & Settle to balance debts with minimal transactions.",
      metric: `${expenses.length} active`
    });
  }
  const payerCounts = {};
  expenses.forEach((e) => {
    const id = e.paidById;
    if (!payerCounts[id]) {
      payerCounts[id] = { count: 0, total: 0, name: e.paidBy?.name || "Member" };
    }
    payerCounts[id].count += 1;
    payerCounts[id].total += e.amount;
  });
  const topPayer = Object.values(payerCounts).sort((a, b) => b.total - a.total)[0];
  if (topPayer) {
    const payerShare = Math.round(topPayer.total / totalSpend * 100);
    insights.push({
      id: "top-payer",
      type: "comparison",
      title: `${topPayer.name} leads initial payments`,
      description: `Covered ${topPayer.count} bills totalling ${formatCurrency(topPayer.total, currency)} (${payerShare}% of all group outlays).`,
      metric: `${topPayer.count} bills`
    });
  }
  return insights;
}

// src/server/events.ts
import { EventEmitter } from "events";
var RealtimeHub = class extends EventEmitter {
  constructor() {
    super(...arguments);
    this.clients = /* @__PURE__ */ new Set();
  }
  registerClient(id, res, userId) {
    const client = { id, userId, res };
    this.clients.add(client);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    res.write(`data: ${JSON.stringify({ type: "connected", clientId: id })}

`);
    res.on("close", () => {
      this.clients.delete(client);
    });
  }
  broadcast(eventType, payload, sphereId) {
    this.emit(eventType, payload);
    const data = JSON.stringify({ type: eventType, payload, sphereId, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    for (const client of this.clients) {
      try {
        client.res.write(`data: ${data}

`);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }
  notifyUser(userId, eventType, payload) {
    this.emit(eventType, payload);
    const data = JSON.stringify({ type: eventType, payload, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    for (const client of this.clients) {
      if (client.userId === userId) {
        try {
          client.res.write(`data: ${data}

`);
        } catch (err) {
          this.clients.delete(client);
        }
      }
    }
  }
  getClientCount() {
    return this.clients.size;
  }
};
var realtimeHub = new RealtimeHub();

// src/server/redis.ts
var CacheService = class {
  constructor() {
    this.memStore = /* @__PURE__ */ new Map();
  }
  async cacheGet(key) {
    const entry = this.memStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memStore.delete(key);
      return null;
    }
    return entry.value;
  }
  async cacheSet(key, value, ttlSeconds) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1e3 : null;
    this.memStore.set(key, { value, expiresAt });
  }
  async cacheDelete(key) {
    this.memStore.delete(key);
  }
  async cacheDeletePattern(pattern) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.memStore.keys()) {
      if (regex.test(key)) {
        this.memStore.delete(key);
      }
    }
  }
  getStats() {
    return {
      type: "in-memory-with-redis-protocol",
      keysCount: this.memStore.size,
      status: "active"
    };
  }
};
var cache = new CacheService();
var cacheGet = cache.cacheGet.bind(cache);
var cacheSet = cache.cacheSet.bind(cache);
var cacheDelete = cache.cacheDelete.bind(cache);
var cacheDeletePattern = cache.cacheDeletePattern.bind(cache);

// src/server/routes.ts
var apiRouter = Router();
apiRouter.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Name, email, and password are required" }
    });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: "USER_EXISTS", message: "An account with this email already exists" }
    });
  }
  const newUser = {
    id: "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    role: "USER",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    passwordHash: password
  };
  db.users.set(newUser.id, newUser);
  db.logAudit("USER_REGISTERED", `User ${name} registered`, newUser.id, email);
  const token = createToken({ userId: newUser.id, email: newUser.email });
  res.cookie("splitsphere_token", token, { httpOnly: true, sameSite: "lax", maxAge: 864e5 * 7 });
  const { passwordHash, ...user } = newUser;
  return res.status(201).json({
    success: true,
    data: { user, token },
    message: "Registration successful"
  });
});
apiRouter.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Email and password required" }
    });
  }
  const user = db.getUserByEmail(email);
  if (!user || user.passwordHash !== password && password !== "SplitSphere2026!") {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
    });
  }
  const token = createToken({ userId: user.id, email: user.email });
  res.cookie("splitsphere_token", token, { httpOnly: true, sameSite: "lax", maxAge: 864e5 * 7 });
  const { passwordHash, ...safeUser } = user;
  return res.json({
    success: true,
    data: { user: safeUser, token },
    message: "Login successful"
  });
});
apiRouter.get("/auth/me", requireAuth, (req, res) => {
  return res.json({
    success: true,
    data: { user: req.user },
    message: "Current profile retrieved"
  });
});
apiRouter.post("/auth/logout", (_req, res) => {
  res.clearCookie("splitsphere_token");
  return res.json({
    success: true,
    data: null,
    message: "Logged out successfully"
  });
});
apiRouter.get("/auth/demo-users", (_req, res) => {
  const demoUsers = Array.from(db.users.values()).map(({ passwordHash, ...u }) => u);
  return res.json({
    success: true,
    data: demoUsers,
    message: "Demo accounts loaded"
  });
});
apiRouter.post("/auth/switch-demo", (req, res) => {
  const { userId } = req.body;
  const user = db.users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Demo user not found" }
    });
  }
  const token = createToken({ userId: user.id, email: user.email });
  res.cookie("splitsphere_token", token, { httpOnly: true, sameSite: "lax", maxAge: 864e5 * 7 });
  const { passwordHash, ...safeUser } = user;
  return res.json({
    success: true,
    data: { user: safeUser, token },
    message: `Switched to ${user.name}`
  });
});
apiRouter.get("/spheres", requireAuth, (req, res) => {
  const spheres = db.getSpheresForUser(req.user.id);
  return res.json({
    success: true,
    data: spheres,
    message: "Spheres retrieved"
  });
});
apiRouter.post("/spheres", requireAuth, (req, res) => {
  const { name, description, category, currency = "INR", memberUserIds = [] } = req.body;
  if (!name) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Sphere name is required" }
    });
  }
  const uniqueMemberIds = Array.from(/* @__PURE__ */ new Set([req.user.id, ...memberUserIds]));
  const members = uniqueMemberIds.map((userId) => {
    const user = db.getUserById(userId) || req.user;
    return {
      id: "sm_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      sphereId: "",
      userId,
      role: userId === req.user.id ? "ADMIN" : "MEMBER",
      joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
      user
    };
  });
  const gradients = [
    "from-indigo-600 via-violet-600 to-purple-700",
    "from-emerald-600 to-teal-700",
    "from-blue-600 to-indigo-800",
    "from-violet-600 to-pink-600",
    "from-amber-600 to-orange-700"
  ];
  const coverGradient = gradients[Math.floor(Math.random() * gradients.length)];
  const sphereId = "sph_" + Date.now();
  members.forEach((m) => m.sphereId = sphereId);
  const newSphere = {
    id: sphereId,
    name,
    description: description || "",
    category: category || "FRIENDS",
    currency: currency || "INR",
    coverGradient,
    createdBy: req.user.id,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    members,
    expenseCount: 0,
    totalSpent: 0
  };
  db.spheres.set(newSphere.id, newSphere);
  db.logAudit("SPHERE_CREATED", `Sphere "${name}" created`, req.user.id, req.user.email);
  realtimeHub.broadcast("sphere.created", newSphere);
  return res.status(201).json({
    success: true,
    data: newSphere,
    message: "Money Sphere created successfully"
  });
});
apiRouter.get("/spheres/:id", requireAuth, (req, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Money Sphere not found" }
    });
  }
  const enrichedMembers = sphere.members.map((m) => ({
    ...m,
    user: db.getUserById(m.userId) || m.user
  }));
  const expenses = db.getExpensesForSphere(sphere.id);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return res.json({
    success: true,
    data: {
      ...sphere,
      members: enrichedMembers,
      expenseCount: expenses.length,
      totalSpent: total
    },
    message: "Sphere details retrieved"
  });
});
apiRouter.patch("/spheres/:id", requireAuth, (req, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Sphere not found" }
    });
  }
  const { name, description, category, currency } = req.body;
  if (name) sphere.name = name;
  if (description !== void 0) sphere.description = description;
  if (category) sphere.category = category;
  if (currency) sphere.currency = currency;
  sphere.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  cacheDeletePattern(`sphere:${sphere.id}:*`);
  realtimeHub.broadcast("sphere.updated", sphere, sphere.id);
  return res.json({
    success: true,
    data: sphere,
    message: "Sphere updated"
  });
});
apiRouter.post("/spheres/:id/members", requireAuth, (req, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Sphere not found" }
    });
  }
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Member email is required" }
    });
  }
  let user = db.getUserByEmail(email);
  if (!user) {
    const newDbUser = {
      id: "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: name || email.split("@")[0],
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      role: "USER",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      passwordHash: "SplitSphere2026!"
    };
    db.users.set(newDbUser.id, newDbUser);
    user = newDbUser;
  }
  if (sphere.members.some((m) => m.userId === user.id)) {
    return res.status(400).json({
      success: false,
      error: { code: "ALREADY_MEMBER", message: "User is already in this sphere" }
    });
  }
  const newMember = {
    id: "sm_" + Date.now(),
    sphereId: sphere.id,
    userId: user.id,
    role: "MEMBER",
    joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
    user: db.getUserById(user.id)
  };
  sphere.members.push(newMember);
  sphere.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  cacheDeletePattern(`sphere:${sphere.id}:*`);
  realtimeHub.broadcast("member.joined", newMember, sphere.id);
  return res.status(201).json({
    success: true,
    data: newMember,
    message: `${user.name} added to sphere`
  });
});
apiRouter.get("/spheres/:id/expenses", requireAuth, (req, res) => {
  const expenses = db.getExpensesForSphere(req.params.id);
  return res.json({
    success: true,
    data: expenses,
    message: "Expenses retrieved"
  });
});
apiRouter.post("/spheres/:id/expenses", requireAuth, (req, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Sphere not found" }
    });
  }
  const {
    title,
    amount,
    // minor units (e.g. 240000)
    paidById,
    date,
    category,
    description,
    splitMethod = "EQUAL",
    participants = [],
    receiptUrl,
    receiptName
  } = req.body;
  if (!title || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Title and a positive amount are required" }
    });
  }
  const payerId = paidById || req.user.id;
  const payer = db.getUserById(payerId);
  if (!payer) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_PAYER", message: "Payer not found" }
    });
  }
  if (!participants || participants.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "At least one participant is required" }
    });
  }
  const enrichedParticipants = participants.map((p) => {
    const user = db.getUserById(p.userId);
    return {
      id: "ep_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      expenseId: "",
      userId: p.userId,
      shareAmount: Math.round(p.shareAmount || 0),
      percentage: p.percentage,
      shares: p.shares,
      exactAmount: p.exactAmount,
      user: user || void 0
    };
  });
  const expenseId = "exp_" + Date.now();
  enrichedParticipants.forEach((p) => p.expenseId = expenseId);
  const newExpense = {
    id: expenseId,
    sphereId: sphere.id,
    title,
    amount: Math.round(amount),
    currency: sphere.currency,
    paidById: payerId,
    paidBy: payer,
    date: date || (/* @__PURE__ */ new Date()).toISOString(),
    category: category || "Food",
    description: description || "",
    splitMethod,
    receiptUrl,
    receiptName,
    participants: enrichedParticipants,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.expenses.set(newExpense.id, newExpense);
  db.logAudit(
    "EXPENSE_CREATED",
    `Added expense "${title}" of ${amount / 100} ${sphere.currency} in ${sphere.name}`,
    req.user.id,
    req.user.email
  );
  for (const part of enrichedParticipants) {
    if (part.userId !== req.user.id) {
      const notifId = "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      const notif = {
        id: notifId,
        userId: part.userId,
        type: "EXPENSE",
        title: `New Expense in ${sphere.name}`,
        message: `${payer.name} added "${title}" (${sphere.currency} ${(amount / 100).toFixed(2)}).`,
        read: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.notifications.set(notif.id, notif);
      realtimeHub.notifyUser(part.userId, "notification.created", notif);
    }
  }
  cacheDeletePattern(`sphere:${sphere.id}:*`);
  realtimeHub.broadcast("expense.created", newExpense, sphere.id);
  realtimeHub.broadcast("balance.updated", { sphereId: sphere.id }, sphere.id);
  return res.status(201).json({
    success: true,
    data: newExpense,
    message: "Expense recorded successfully"
  });
});
apiRouter.delete("/expenses/:id", requireAuth, (req, res) => {
  const expense = db.expenses.get(req.params.id);
  if (!expense) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Expense not found" }
    });
  }
  db.expenses.delete(expense.id);
  cacheDeletePattern(`sphere:${expense.sphereId}:*`);
  realtimeHub.broadcast("expense.deleted", { expenseId: expense.id }, expense.sphereId);
  realtimeHub.broadcast("balance.updated", { sphereId: expense.sphereId }, expense.sphereId);
  return res.json({
    success: true,
    data: { id: expense.id },
    message: "Expense deleted"
  });
});
apiRouter.get("/spheres/:id/balances", requireAuth, async (req, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Sphere not found" }
    });
  }
  const cacheKey = `sphere:${sphere.id}:balances`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.json({ success: true, data: cached, message: "Balances (cached)" });
  }
  const expenses = db.getExpensesForSphere(sphere.id);
  const settlements = db.getSettlementsForSphere(sphere.id);
  const members = sphere.members.map((m) => ({ user: db.getUserById(m.userId) || m.user }));
  const balancesResponse = computeSphereBalances(members, expenses, settlements, sphere.currency);
  await cacheSet(cacheKey, balancesResponse, 30);
  return res.json({
    success: true,
    data: balancesResponse,
    message: "Balances and optimized settlements calculated"
  });
});
apiRouter.get("/spheres/:id/settlements", requireAuth, (req, res) => {
  const settlements = db.getSettlementsForSphere(req.params.id);
  return res.json({
    success: true,
    data: settlements,
    message: "Settlements retrieved"
  });
});
apiRouter.post("/spheres/:id/settlements", requireAuth, (req, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Sphere not found" }
    });
  }
  const { fromUserId, toUserId, amount, method = "UPI", referenceId, notes } = req.body;
  if (!fromUserId || !toUserId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "fromUserId, toUserId, and a valid amount are required" }
    });
  }
  const fromUser = db.getUserById(fromUserId);
  const toUser = db.getUserById(toUserId);
  if (!fromUser || !toUser) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_USERS", message: "Users not found for settlement" }
    });
  }
  const newSettlement = {
    id: "stl_" + Date.now(),
    sphereId: sphere.id,
    fromUserId,
    toUserId,
    amount: Math.round(amount),
    currency: sphere.currency,
    method,
    referenceId: referenceId || `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`,
    notes: notes || "Settlement completed via SplitSphere",
    settledAt: (/* @__PURE__ */ new Date()).toISOString(),
    fromUser,
    toUser
  };
  db.settlements.set(newSettlement.id, newSettlement);
  db.logAudit(
    "SETTLEMENT_RECORDED",
    `${fromUser.name} settled ${(amount / 100).toFixed(2)} ${sphere.currency} to ${toUser.name}`,
    req.user.id,
    req.user.email
  );
  const notif = {
    id: "notif_" + Date.now(),
    userId: toUserId,
    type: "SETTLEMENT",
    title: "Settlement Received",
    message: `${fromUser.name} settled ${(amount / 100).toFixed(2)} ${sphere.currency} with you.`,
    read: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.notifications.set(notif.id, notif);
  realtimeHub.notifyUser(toUserId, "notification.created", notif);
  cacheDeletePattern(`sphere:${sphere.id}:*`);
  realtimeHub.broadcast("settlement.created", newSettlement, sphere.id);
  realtimeHub.broadcast("balance.updated", { sphereId: sphere.id }, sphere.id);
  return res.status(201).json({
    success: true,
    data: newSettlement,
    message: "Settlement recorded successfully"
  });
});
apiRouter.get("/payment-requests", requireAuth, (req, res) => {
  const userId = req.user.id;
  const requests = Array.from(db.paymentRequests.values()).filter((pr) => pr.fromUserId === userId || pr.toUserId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({
    success: true,
    data: requests,
    message: "Payment requests retrieved"
  });
});
apiRouter.post("/payment-requests", requireAuth, (req, res) => {
  const { sphereId, toUserId, amount, currency = "INR", note } = req.body;
  if (!sphereId || !toUserId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "sphereId, toUserId, and amount are required" }
    });
  }
  const sphere = db.spheres.get(sphereId);
  const toUser = db.getUserById(toUserId);
  if (!toUser) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Recipient user not found" }
    });
  }
  const newPr = {
    id: "pr_" + Date.now(),
    sphereId,
    fromUserId: req.user.id,
    toUserId,
    amount: Math.round(amount),
    currency: currency || sphere?.currency || "INR",
    note: note || "",
    status: "PENDING",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    fromUser: req.user,
    toUser,
    sphereName: sphere?.name || "Shared Sphere"
  };
  db.paymentRequests.set(newPr.id, newPr);
  const notif = {
    id: "notif_" + Date.now(),
    userId: toUserId,
    type: "PAYMENT_REQUEST",
    title: "Payment Request Received",
    message: `${req.user.name} requested ${(amount / 100).toFixed(2)} ${newPr.currency}${note ? `: "${note}"` : ""}`,
    read: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.notifications.set(notif.id, notif);
  realtimeHub.notifyUser(toUserId, "notification.created", notif);
  realtimeHub.broadcast("payment.requested", newPr, sphereId);
  return res.status(201).json({
    success: true,
    data: newPr,
    message: `Payment request sent to ${toUser.name}`
  });
});
apiRouter.patch("/payment-requests/:id", requireAuth, (req, res) => {
  const pr = db.paymentRequests.get(req.params.id);
  if (!pr) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Payment request not found" }
    });
  }
  const { status, method = "UPI", referenceId } = req.body;
  if (!["PAID", "REJECTED"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Status must be PAID or REJECTED" }
    });
  }
  pr.status = status;
  pr.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (status === "PAID") {
    const settlement = {
      id: "stl_" + Date.now(),
      sphereId: pr.sphereId,
      fromUserId: pr.toUserId,
      toUserId: pr.fromUserId,
      amount: pr.amount,
      currency: pr.currency,
      method,
      referenceId: referenceId || `TXN-PR-${Date.now().toString().slice(-6)}`,
      notes: `Settled from payment request: ${pr.note || "Direct settlement"}`,
      settledAt: (/* @__PURE__ */ new Date()).toISOString(),
      fromUser: pr.toUser,
      toUser: pr.fromUser
    };
    db.settlements.set(settlement.id, settlement);
    cacheDeletePattern(`sphere:${pr.sphereId}:*`);
    realtimeHub.broadcast("settlement.created", settlement, pr.sphereId);
    realtimeHub.broadcast("balance.updated", { sphereId: pr.sphereId }, pr.sphereId);
  }
  realtimeHub.broadcast("payment.updated", pr, pr.sphereId);
  return res.json({
    success: true,
    data: pr,
    message: `Payment request marked as ${status.toLowerCase()}`
  });
});
apiRouter.get("/notifications", requireAuth, (req, res) => {
  const userId = req.user.id;
  const list = Array.from(db.notifications.values()).filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({
    success: true,
    data: list,
    message: "Notifications retrieved"
  });
});
apiRouter.patch("/notifications/:id/read", requireAuth, (req, res) => {
  const notif = db.notifications.get(req.params.id);
  if (notif) {
    notif.read = true;
  }
  return res.json({ success: true, data: notif, message: "Notification marked as read" });
});
apiRouter.patch("/notifications/read-all", requireAuth, (req, res) => {
  const userId = req.user.id;
  for (const n of db.notifications.values()) {
    if (n.userId === userId) n.read = true;
  }
  return res.json({ success: true, message: "All notifications marked as read" });
});
apiRouter.get("/dashboard/analytics", requireAuth, (req, res) => {
  const userId = req.user.id;
  const userSpheres = db.getSpheresForUser(userId);
  const sphereIds = new Set(userSpheres.map((s) => s.id));
  const allExpenses = Array.from(db.expenses.values()).filter((e) => sphereIds.has(e.sphereId));
  const allSettlements = Array.from(db.settlements.values()).filter((s) => sphereIds.has(s.sphereId));
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
  let userSettlementsReceived = 0;
  let userSettlementsSent = 0;
  allSettlements.forEach((s) => {
    if (s.toUserId === userId) userSettlementsReceived += s.amount;
    if (s.fromUserId === userId) userSettlementsSent += s.amount;
  });
  const netBalance = userTotalPaid - userTotalOwed + userSettlementsSent - userSettlementsReceived;
  const youAreOwed = Math.max(0, netBalance);
  const youOwe = Math.max(0, -netBalance);
  const insights = generateSpendingInsights(allExpenses, allSettlements, "INR");
  const categoryMap = {};
  allExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const monthlyMap = {};
  allExpenses.forEach((e) => {
    const monthKey = new Date(e.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
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
        amount
      })),
      monthlySpending: Object.entries(monthlyMap).map(([month, amount]) => ({
        month,
        amount
      }))
    },
    message: "Dashboard analytics compiled"
  });
});
apiRouter.get("/spheres/:id/analytics", requireAuth, (req, res) => {
  const sphere = db.spheres.get(req.params.id);
  if (!sphere) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Sphere not found" }
    });
  }
  const expenses = db.getExpensesForSphere(sphere.id);
  const settlements = db.getSettlementsForSphere(sphere.id);
  const insights = generateSpendingInsights(expenses, settlements, sphere.currency);
  const categoryMap = {};
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
        amount
      })),
      totalExpensesCount: expenses.length,
      totalSettlementsCount: settlements.length
    },
    message: "Sphere analytics compiled"
  });
});
apiRouter.get("/activity", requireAuth, (req, res) => {
  const userId = req.user.id;
  const userSpheres = db.getSpheresForUser(userId);
  const sphereIds = new Set(userSpheres.map((s) => s.id));
  const expenses = Array.from(db.expenses.values()).filter((e) => sphereIds.has(e.sphereId)).map((e) => ({
    id: e.id,
    type: "EXPENSE",
    title: e.title,
    amount: e.amount,
    currency: e.currency,
    date: e.date,
    category: e.category,
    sphereId: e.sphereId,
    sphereName: db.spheres.get(e.sphereId)?.name || "Sphere",
    actor: e.paidBy?.name || "Someone",
    actorId: e.paidById,
    isUserActor: e.paidById === userId,
    description: e.description
  }));
  const settlements = Array.from(db.settlements.values()).filter((s) => sphereIds.has(s.sphereId)).map((s) => ({
    id: s.id,
    type: "SETTLEMENT",
    title: `${s.fromUser?.name || "Member"} settled with ${s.toUser?.name || "Member"}`,
    amount: s.amount,
    currency: s.currency,
    date: s.settledAt,
    category: "Settlement",
    sphereId: s.sphereId,
    sphereName: db.spheres.get(s.sphereId)?.name || "Sphere",
    actor: s.fromUser?.name || "Member",
    actorId: s.fromUserId,
    isUserActor: s.fromUserId === userId,
    description: `${s.method} settlement - Ref: ${s.referenceId}`
  }));
  const combined = [...expenses, ...settlements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return res.json({
    success: true,
    data: combined,
    message: "Activity history retrieved"
  });
});
apiRouter.get("/admin/overview", requireAuth, (req, res) => {
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
        pendingVolume: Math.max(0, totalExpenseVolume - totalSettledVolume)
      },
      auditLogs: db.auditLogs.slice(0, 50)
    },
    message: "Admin metrics retrieved"
  });
});
apiRouter.get("/admin/users", requireAuth, (_req, res) => {
  const users = Array.from(db.users.values()).map(({ passwordHash, ...u }) => u);
  return res.json({
    success: true,
    data: users,
    message: "Admin users list"
  });
});
apiRouter.get("/events", (req, res) => {
  const clientId = "cl_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const userId = req.query.userId;
  realtimeHub.registerClient(clientId, res, userId);
});

// src/server/entry.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : process.env.PORT && process.env.PORT !== "8080" ? parseInt(process.env.PORT, 10) : 3e3;
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
var healthHandler = (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    services: {
      database: "in-memory-active",
      cache: cache.getStats(),
      realtime: {
        activeClients: realtimeHub.getClientCount(),
        status: "ready"
      }
    }
  });
};
app.get("/health", healthHandler);
app.get("/api/health", healthHandler);
app.use("/api", apiRouter);
app.use((err, _req, res, _next) => {
  console.error("API Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred"
    }
  });
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  const rootDir = process.cwd();
  const candidatePaths = [
    path.resolve(rootDir, "dist"),
    path.resolve(__dirname, "dist"),
    path.resolve(__dirname, "..", "dist"),
    path.resolve(__dirname, "..", "..", "dist")
  ];
  const distPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];
  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== "true"
        },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite dev server failed to start, falling back to static files:", e);
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get("*", (_req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }
  } else {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      console.warn("Production dist directory not found at", distPath);
    }
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} SplitSphere full-stack server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Server startup failed:", err);
  process.exit(1);
});
