# 🔐 AccessOps

> Enterprise-grade admin dashboard built with **Next.js 16, TypeScript,
> shadcn/ui and TanStack Query**

AccessOps is a modern role-based access control (RBAC) management
dashboard that demonstrates production-ready frontend architecture,
scalable UI patterns, and enterprise-level UX decisions.

This project showcases how to build complex admin systems using modern
React tooling and clean architecture principles.

---

## 🚀 Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **shadcn/ui + TailwindCSS**
- **TanStack Query**
- **Zod**
- **React Hook Form**
- **MSW (API mocking)**
- Feature-Sliced inspired architecture

---

## ✨ Features (Planned / In Progress)

- 🔐 Role-based access control (RBAC)
- 👥 Users management (CRUD)
- 🧩 Permission matrix editor
- 📜 Audit log with filters & infinite scroll
- ⚡ Optimistic UI updates
- 🔄 Real-time updates (mocked WebSocket)
- 🧪 API mocking via MSW
- 🏗 Scalable architecture structure

---

## 📂 Project Structure

    src/
     ├── app/                # Next.js routes
     ├── entities/           # Business entities (User, Role)
     ├── features/           # Application features
     ├── widgets/            # Complex UI blocks
     ├── shared/
     │    ├── ui/            # Design system components
     │    ├── lib/           # Utilities
     │    └── types/         # Shared types

Architecture is focused on scalability and separation of concerns.

---

## 🛠 Getting Started

### Install dependencies

```bash
pnpm install
```

### Run development server

```bash
pnpm dev
```

Open in browser:

http://localhost:3000

---

## 🧪 Lint & Formatting

```bash
pnpm lint
pnpm typecheck
pnpm format
pnpm test
pnpm e2e
```

---
