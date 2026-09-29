# SplitSphere

> **"Every expense. One clear balance."**

SplitSphere is a payments & expense sharing platform built with the **Financial Orbit** design system. It allows friends, roommates, travel groups, families, and teams to effortlessly track shared expenses, preview live splits with exact decimal precision, visualize mutual balances on an interactive node canvas, and simplify debts with one-tap greedy cash-flow optimization.

---

## ⚡ Quickstart

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Run the application via Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Open the frontend:
   ```
   http://localhost:3000
   ```
4. Login with a development demo account:
   - **Email:** `gopi@example.com` (Admin)
   - **Password:** `SplitSphere2026!`

---

## 👥 Demo Credentials

The platform is pre-seeded with realistic members, shared expenses, settlements, and payment requests:

| Name | Email | Role | Dev Password |
| :--- | :--- | :--- | :--- |
| **Gopi M** | `gopi@example.com` | **ADMIN** | `SplitSphere2026!` |
| **Saro** | `saro@example.com` | **MEMBER** | `SplitSphere2026!` |
| **Priya Sharma** | `priya@example.com` | **MEMBER** | `SplitSphere2026!` |
| **Karthik R** | `karthik@example.com` | **MEMBER** | `SplitSphere2026!` |

> You can also use the **1-Click Demo Switcher** directly in the UI to instantly jump between personas.

---

## 🚀 Key Features

### 1. 🪐 Financial Orbit Live Network
An interactive visualization where group members are represented as orbital nodes. Connections depict live debts and directions of repayment. Clicking any member exposes their total paid, total owed, net position, and direct settlement paths.

### 2. ⚡ Live Split Preview
As you enter an expense amount, SplitSphere immediately computes each participant's allocation in real time:
* **Equal**: Evenly distributes minor currency units (paise/cents) and preserves remainder units so the sum of individual shares exactly matches the bill.
* **Exact Amount**: Enforces strict mathematical equality between itemized values and total.
* **Percentage**: Real-time validation requiring exact 100% allocation.
* **Shares**: Proportional weight allocations (e.g. 2 shares vs 1 share).

### 3. 🧠 SplitSense™ Deterministic Intelligence
An embedded smart assistant providing clear, natural-language breakdowns of expense fairness, net reimbursements, and settlement directions without requiring external AI APIs.

### 4. 🔀 One-Tap Settlement Optimization ("Simplify & Settle")
A greedy min-cash-flow algorithm running on the backend that eliminates circular debts. For example, 4 members with 8 mutual debts are simplified into at most 3 direct payments.

### 5. 🛡️ Settlement Health Score
A group metric (0–100) assessing:
* Ratio of settled volume to total spending
* Age of oldest pending debts
* Count of unresolved participants

### 6. 📊 Deterministic Spending Insights & Analytics
Calculates real spending statistics from database ledgers:
* Top category distributions
* Average expense transaction velocity
* Frequent payers
* Settlement completion velocity

### 7. 🧾 Receipt Attachment & CSV Exports
* Attach and preview receipts (JPG, PNG, WEBP, PDF up to 5MB)
* One-click CSV export of transaction ledgers

### 8. 🔔 Realtime Notifications & SSE
Instant balance and notification updates dispatched via Server-Sent Events without manual page refreshes.

---

## 🛠️ Architecture & Tech Stack

### Frontend
* **Framework:** React 19 + TypeScript + Vite
* **Design System:** Financial Orbit with Tailwind CSS (Indigo, Violet, Emerald, Amber, Rose)
* **Icons:** Lucide React
* **Typography:** Plus Jakarta Sans & JetBrains Mono (tabular numerals)
* **Realtime:** Server-Sent Events / EventSource

### Backend
* **Runtime:** Node.js 22 + Express + TypeScript (`server.ts`)
* **Security:** Cryptographic JWT tokens, HTTP-only session cookies, CORS, XSS headers
* **Database & ORM:** PostgreSQL + Prisma Schema (`prisma/schema.prisma`) with resilient in-memory development store
* **Cache:** Redis client abstraction with in-memory TTL fallback (`src/server/redis.ts`)
* **Financial Calculations:** Decimal-safe integer minor units (paise/cents)

### Infrastructure
* **Containerization:** Multi-stage `Dockerfile` and `docker-compose.yml`
* **Services:** PostgreSQL 16, Redis 7, Full-Stack Node.js app

---

## 📡 API Endpoints

### Authentication
* `POST /api/auth/register` - Create new user account
* `POST /api/auth/login` - Authenticate and receive JWT cookie / token
* `POST /api/auth/logout` - Clear session
* `GET  /api/auth/me` - Get current authenticated user
* `GET  /api/auth/demo-users` - Retrieve demo personas
* `POST /api/auth/switch-demo` - Switch active demo persona

### Money Spheres
* `GET    /api/spheres` - List user's Money Spheres
* `POST   /api/spheres` - Create a new Money Sphere
* `GET    /api/spheres/:id` - Retrieve sphere details
* `PATCH  /api/spheres/:id` - Update sphere metadata
* `POST   /api/spheres/:id/members` - Add member to sphere

### Expenses
* `GET    /api/spheres/:id/expenses` - List expenses in sphere
* `POST   /api/spheres/:id/expenses` - Record new expense with live split
* `DELETE /api/expenses/:id` - Delete an expense

### Balances & Settlements
* `GET    /api/spheres/:id/balances` - Calculate net balances, health score, and simplified debts
* `GET    /api/spheres/:id/settlements` - Retrieve settlement history
* `POST   /api/spheres/:id/settlements` - Record verified settlement

### Payment Requests
* `GET    /api/payment-requests` - List incoming and outgoing requests
* `POST   /api/payment-requests` - Request funds from a member
* `PATCH  /api/payment-requests/:id` - Mark as PAID or REJECTED

### Analytics & Activity
* `GET    /api/dashboard/analytics` - Aggregate user spending metrics & insights
* `GET    /api/activity` - Searchable activity history
* `GET    /health` - System health check

---

## 🧪 Testing

Run the automated algorithmic test suite:
```bash
npx tsx tests/settlement-engine.test.ts
```
Tests cover:
* Equal split integer remainder preservation
* Percentage split validation
* Proportional shares allocation
* Greedy min-cash-flow debt simplification
* Partial settlements & net balance reconciliation
* SplitSense assistant analysis

---

## 💻 Local Development (without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Run the full-stack server
npm run dev

# 3. Compile / Lint checks
npm run lint
npm run build
```

---

## 🔒 Security Practices

1. Passwords are never returned in API payloads.
2. Tokens are stored in secure cookies with bearer token header compatibility.
3. Minor currency units eliminate floating point truncation bugs.
4. Centralized error middleware prevents stack traces from leaking to client responses.
