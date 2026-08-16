# ⬛ XOCHAT — Anonymous. Real-Time. Secure.

> **Communication stripped to its absolute essence.** No phone numbers. No emails. No metadata retention. Pure cryptographic signal.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?style=flat-square&logo=socket.io)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

---

## 👁️ Overview

**XOChat** is a zero-knowledge, privacy-first real-time messaging application built on the principles of **Swiss International Typographic Design** and **architectural brutalism**.

Traditional messaging platforms log phone numbers, track location metadata, index contacts, and archive communication histories permanently. **XOChat rejects digital permanence.** Identities are purely cryptographic, communications live in the moment, and abandoned namespaces are automatically recycled.

---

## ⚡ Key Core Features

### 1. 🛡️ Zero-Log Anonymous Identity
- **No Personal Identifiers**: Users claim a unique `@username` without providing an email address, phone number, or password.
- **Session Tokens**: Authentication is managed via cryptographically secure 256-bit session tokens stored in HttpOnly cookies and tab-isolated `sessionStorage`.

### 2. 🔑 Argon2id Cryptographic Account Recovery
- **One-Time Recovery Key**: Upon identity creation, the user is presented with a 16-character cryptographic recovery key (e.g. `XO-8F4C-3E90-A11B-44C1`).
- **Zero-Knowledge Server**: The server **never** stores the raw key. It calculates and stores only an **Argon2id** hash (OWASP recommended memory-hard hashing algorithm).
- **Session Rotation**: If a user clears their browser storage, they can restore identity ownership using their recovery key, which immediately invalidates all previous sessions.

### 3. 📡 Real-Time WebSockets (Socket.IO v4)
- **Instant Messaging**: Bidirectional WebSocket communication with sub-15ms message delivery across room unions.
- **Live Typing Indicators**: Real-time typing states (`typing:start`, `typing:stop`) with automatic 2-second timeout resets.
- **Presence & Status**: Real-time online/offline indicators and last-active timestamps.
- **Read Receipts & Unread Badges**: Real-time `message:seen` notifications and unread message counters.

### 4. 🔏 Anti-Spam Chat Request System
- **Mandatory Handshake**: Strangers cannot message you directly. Communication requires an explicit Chat Request (`send`, `accept`, `reject`, `cancel`, `block`).
- **Connection Isolation**: Incoming requests are managed in a dedicated connections tab. Accepting a request immediately establishes a private, dual-user encrypted channel.

### 5. 🧹 24-Hour Ephemeral Auto-Cleanup
- **Automated Namespace Recycler**: An automated background job runs every 24 hours to purge abandoned accounts.
- **Squatting Protection**: Any account that is inactive for **7 consecutive days** AND has zero active chats, blocks, pending requests, or media files is permanently wiped from the database, releasing dormant usernames back to the community safely.

### 6. 🖼️ Ephemeral Media Sharing
- **Secure Image Uploads**: Inline image sharing supporting JPG, PNG, GIF, and WebP formats up to 5 MB.
- **Full-Screen Viewer**: Interactive image modal viewer with local file download controls.

### 7. 📱 Mobile Viewport & Dynamic Height Optimization (`100dvh`)
- **Dynamic Viewport Height (`100dvh`)**: Automatically calculates true visual viewport height on iOS Safari and Android Chrome, preventing URL bar expansion bugs.
- **Soft Keyboard Handling**: Integrated `interactiveWidget: 'resizes-visual'` metadata preventing input bar cutoffs when mobile keyboards open.

---

## 🔒 Privacy & Security Matrix

| Security Layer | Implementation Detail | Benefit |
| :--- | :--- | :--- |
| **Account Recovery** | Argon2id (`@node-rs/argon2`) | Memory-hard password hashing resistant to GPU/ASIC brute-force attacks. |
| **Session Cookies** | `HttpOnly`, `SameSite=Strict/None`, `Secure` | Complete protection against XSS cookie theft and CSRF attacks. |
| **Tab Isolation** | `sessionStorage` fallback | Prevents multi-account cookie collisions when running multiple tabs/incognito windows on the same browser profile. |
| **Transport Layer** | TLS 1.3 WebSockets | All payload traffic encrypted in transit. |
| **Rate Limiting** | `express-rate-limit` | IP-based limiters on identity creation, recovery attempts, message sending, and username lookups. |
| **Input Sanitization** | `sanitizeText` utility & Zod schemas | Strict string trimming and HTML entity escaping preventing XSS injection. |

---

## 🎨 Design Philosophy: Brutalist Swiss Architecture

XOChat's user interface is heavily inspired by **International Typographic Style (Swiss Style)**:
- **Typography as Structure**: Objective display type set in *Hanken Grotesk* and *JetBrains Mono*.
- **Grid Alignment**: Rigid 12-column layouts with explicit 2px solid borders (`border-2 border-border`).
- **Color Palette**: High-contrast stark monochrome background (`#F9F9F9` light / `#0A0A0C` dark) accentuated with Swiss Safety Orange (`#FF4F00`).
- **No Decorative Bloat**: Zero rounded corners (`rounded-none`), sharp hard shadows (`box-shadow: 6px 6px 0px 0px var(--border)`).

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Form Handling**: React Hook Form + Zod (`@hookform/resolvers`)
- **Real-Time Client**: Socket.IO Client v4

### Backend (`/server`)
- **Runtime**: Node.js & TypeScript (`tsx`)
- **Server Framework**: Express.js
- **Real-Time Engine**: Socket.IO Server v4
- **Database**: Supabase (PostgreSQL)
- **Cryptography**: Argon2id (`@node-rs/argon2`)
- **Security Middleware**: Helmet, CORS, Express Rate Limit
- **File Uploads**: Multer

---

## 📁 Repository Structure

```
XO chat/
├── client/                     # Frontend Next.js Application
│   ├── public/                 # Favicons, WebManifest, Static Icons
│   ├── src/
│   │   ├── app/                # Next.js App Router (pages, sitemap, robots, layout)
│   │   │   ├── chat/           # Dashboard & Chat Window routes
│   │   │   ├── recover/        # Account Recovery route
│   │   │   ├── layout.tsx      # Root Layout (Fonts, Metadata, Viewport, JSON-LD)
│   │   │   └── page.tsx        # Server-Rendered Landing Page (SSR)
│   │   ├── components/         # React Components
│   │   │   ├── auth/           # Identity Modals, Recovery Forms
│   │   │   ├── chat/           # Sidebar, ChatWindow, MessageBubble, MessageInput
│   │   │   ├── landing/        # Navbar, Hero, Features, FAQ, Footer
│   │   │   ├── modals/         # Settings, Profile, Request, Image Preview Modals
│   │   │   └── ui/             # Brutalist Buttons, Inputs, Avatars, Badges
│   │   ├── lib/                # API client, Socket client, Constants
│   │   ├── providers/          # SocketProvider, ToastProvider
│   │   ├── stores/             # Zustand stores (userStore, chatStore, uiStore)
│   │   └── types/              # TypeScript Interface Definitions
│   └── package.json
│
└── server/                     # Backend Node.js Express & Socket.IO Application
    ├── src/
    │   ├── config/             # Supabase, Environment Variables
    │   ├── controllers/        # Express REST Controllers (Users, Messages, Requests)
    │   ├── database/           # PostgreSQL Migrations & Schema Scripts
    │   ├── jobs/               # Background Cron Jobs (Inactive User Auto-Cleanup)
    │   ├── middleware/         # Authenticate, Rate Limiters, Request Validation
    │   ├── repositories/       # Supabase Database Repositories
    │   ├── services/           # Business Logic & Socket Event Broadcasters
    │   ├── socket/             # Socket.IO Event Handlers (Presence, Messages, Typing)
    │   └── index.ts            # Server Entrypoint
    └── package.json
```

---

## 🚀 Getting Started & Setup Guide

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Supabase Account**: PostgreSQL Database project

---

### 1. Database Setup (Supabase)
Run the migration scripts located in `server/src/database/` in your Supabase SQL Editor:
1. Run `migrations.sql` (Creates `users`, `conversations`, `messages`, `chat_requests`, `blocked_users` tables and indexes).
2. Run `migrations_v2.sql` (Adds media storage policies and rate-limit support).

---

### 2. Backend Setup (`/server`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file inside `/server`:
   ```env
   PORT=3001
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SESSION_SECRET=your-random-32-byte-secret-key
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will launch on `http://localhost:3001`.

---

### 3. Frontend Setup (`/client`)

1. Open a new terminal tab and navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file inside `/client`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend application will launch on `http://localhost:3000`.

---

## 🎯 Verification & Build Commands

### Frontend Production Build
```bash
cd client
npm run build
```

### Backend Typecheck & Build
```bash
cd server
npm run build
```


---

## ⏰ Keeping Render & Supabase Alive 24/7 (Free Tier Keep-Alive)

Both **Render Free Web Services** (which sleep after 15 minutes of inactivity) and **Supabase Free Tier** (which auto-pauses after 7 days of inactivity) are kept alive automatically in XOChat:

### 1. Built-in Server Keep-Alive Jobs
- **Render Backend Self-Ping** ([`keepRenderAlive.ts`](file:///c:/Users/joshi/Documents/projects/XO%20chat/server/src/jobs/keepRenderAlive.ts)): Self-pings `/api/health` every **10 minutes** when running on Render (`RENDER_EXTERNAL_URL`), keeping the web service continuously awake.
- **Supabase DB Ping** ([`keepSupabaseAlive.ts`](file:///c:/Users/joshi/Documents/projects/XO%20chat/server/src/jobs/keepSupabaseAlive.ts)): Sends a lightweight query every **3 days** to prevent Supabase auto-pausing.

### 2. GitHub Action Automated Ping Workflow ([`keep-alive.yml`](file:///c:/Users/joshi/Documents/projects/XO%20chat/.github/workflows/keep-alive.yml))
- Automatically pings Render `/api/health` every **14 minutes** and Supabase REST API every **4 days** in the background.
- **Setup Instructions**:
  1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
  2. Add Secrets:
     - `RENDER_SERVER_URL`: `https://your-app.onrender.com`
     - `SUPABASE_URL`: `https://your-project.supabase.co`
     - `SUPABASE_ANON_KEY`: `your-supabase-anon-key`

### 3. Alternative 100% Free Option (UptimeRobot / cron-job.org)
- You can also create a free monitor on [UptimeRobot.com](https://uptimerobot.com) targeting `https://your-app.onrender.com/api/health` every 5 minutes. This ensures Render never sleeps, which in turn keeps all backend jobs and Supabase active 24/7!

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center><b>XOCHAT // ZERO_LOG // SWISS_STRUCTURE</b></p>
