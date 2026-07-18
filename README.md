# FitLedger — Premium Gym SaaS Monorepo

FitLedger is a state-of-the-art Gym SaaS application designed for gym owners to manage memberships, log financial records, host events, track check-ins, and analyze business metrics. Built as a high-performance monorepo using **pnpm workspaces** and **Turborepo**, it features shared configurations, unified schemas, and fully responsive, glassmorphic interfaces.

---

## 📂 Repository Structure

The monorepo structure is divided into applications (`apps/`) and shared library packages (`packages/`):

```bash
gym-saas/
├── apps/
│   ├── web/          # React SPA client (Vite + TS + TailwindCSS + React Query)
│   └── api/          # RESTful Backend API (Node.js + Express + Mongoose + TS)
├── packages/
│   ├── config/       # Shared build & lint configurations
│   ├── types/        # Common TypeScript interfaces & database schemas
│   └── validation/   # Shared Zod validation schemas (shared by client & API)
├── package.json      # Root configuration & workspace definitions
├── pnpm-workspace.yaml
└── turbo.json        # Turborepo task pipeline config
```

---

## ⚡ Core Features

- **📊 Controlling Dashboard:**
  - Real-time summaries of total/active members, expiring soon packages, and expired accounts.
  - Interactive "How it works" guide overlay explaining each dashboard feature.
  - Compact, high-density mobile interface featuring a responsive 2-column metrics grid.
- **📅 Events & Verification Flow:**
  - Create events with payment QR codes, click-to-copy UPI IDs, and optional promotional posters.
  - Public registration portals allowing members to register, input UTR transaction codes, and upload receipt images.
  - Admin payment verification panel to manually approve or decline pending event entries, instantly updating the global pending notification badge.
- **👥 Member & Attendance Management:**
  - Profile directories tracking joining dates, emergency contacts, and active plans.
  - Clean modal forms designed with icon-decorated dividers matching the event creation style.
  - Simple one-click "Mark Attendance" row actions.
  - Complete history logs tracking previous plan subscriptions and outstanding payment balances.
- **💰 Financial Logs & Invoicing:**
  - Track payments, cash transactions, and pending balances.
  - Generate and print formatted confirmation receipts instantly upon member transactions.
- **📈 Localized Analytics (Reports):**
  - Interactive charts illustrating monthly revenue streams, new signup groups, and renewal percentages.
  - Multi-timezone report calculations ensuring morning/night records correspond to local gym time instead of falling back to UTC.
- **⚙️ Settings Panel:**
  - Customize gym brand name, support emails, contact numbers, billing currencies, and local timezones.
  - Secure Cloudinary storage integration for gym logos, receipt uploads, and event posters.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Monorepo** | Turborepo, pnpm workspaces | Efficient builds, caching, and dependency management |
| **Frontend** | React 18, Vite, TypeScript | Client-side engine |
| **Styling** | TailwindCSS, Lucide icons, Radix UI | Visual layout system & component primitives |
| **State & API** | React Query (Tanstack), Axios | Server-state synchronizations |
| **Backend** | Express, Node.js, TypeScript | API server implementation |
| **Database** | MongoDB, Mongoose ORM | Persistent data store |
| **Validation** | Zod | Unified schemas shared across client & backend |
| **Emails** | Nodemailer | Transactional confirmation emails |
| **Media** | Cloudinary API | Static asset and receipt image hosting |

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **pnpm** (Package manager, `npm install -g pnpm`)
- **MongoDB** (Local instance or Atlas connection URI)

---

### 🔧 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/gym-saas.git
   cd gym-saas
   ```

2. **Install all workspace dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in **`apps/api`**:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gym-saas
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   # Cloudinary Media Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Configuration (for event transaction confirmations)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   EMAIL_FROM=FitLedger <your_email@gmail.com>
   ```

   Create a `.env` file in **`apps/web`**:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

---

### 💻 Running Locally

To start the dev servers for both the React frontend and the Express backend simultaneously:

```bash
pnpm dev
```

- **Frontend:** Runs at [http://localhost:5173](http://localhost:5173)
- **Backend API:** Runs at [http://localhost:5000](http://localhost:5000)

To run a production-ready build verification across all packages in the workspace:

```bash
pnpm build
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
