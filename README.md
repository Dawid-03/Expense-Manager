# 💰 Expense Manager – Fullstack App (NestJS + Prisma + Next.JS)

A simple fullstack Expense Manager application that allows users to manage their incomes and expenses, organize them by categories, and generate summary reports.

Built with:

- 🧠 **NestJS** for backend
- 🗄️ **PostgreSQL + Prisma** for database and ORM
- ⚛️ **NextJS** for frontend
- 📦 **Monorepo** structure with shared dev scripts

---

## 📂 Project Structure

```
expense-manager/
├── client/ # NextJS frontend
├── server/ # NestJS backend with Prisma
├── .gitignore
├── README.md
└── package.json
```

---

## 🧪 Features

- User authentication (JWT-based)
- CRUD for expenses and incomes
- Expense/income categories (with type: INCOME or EXPENSE)
- Monthly summary reports
- Filtering by date/category
- Clean and modular codebase
- PostgreSQL database with Prisma ORM

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Dawid-03/Expense-Manager.git
cd Expense-Manager
```

### 2. Install dependencies

#### Backend

```bash
cd server
yarn install
```

#### Frontend

```bash
cd ../client
yarn install
```

### 3. Environment Variables

#### Backend `.env` file example:

```
DATABASE_URL=postgresql://user:password@localhost:5432/expense_manager
JWT_SECRET=your_jwt_secret
```

> Make sure your PostgreSQL database is running and matches the credentials.

---

## 🧱 Database Setup

Inside the `server/` directory:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🧪 Development Scripts (root level)

```bash

# Start both frontend and backend in parallel

yarn dev

# Start only backend

yarn dev:server

# Start only frontend

yarn dev:client
```

> Requires `concurrently` package in the root (`yarn add -D concurrently`)

---

## 📘 API Documentation

API is RESTful and documented using Swagger (optional).

Base URL: `http://localhost:3000/api`

Example endpoints:

- `POST /auth/register` – register user
- `POST /auth/login` – login and receive JWT
- `GET /expenses` – list all expenses
- `GET /reports/monthly` – income/expense summary

---

## 🧠 Future Improvements

- Email/password recovery
- CSV export for reports
- Mobile-friendly frontend
- Cron jobs for recurring expenses
- Redis cache for frequently requested data

---

## 🧔 Author

Made with 💪 by a backend-focused developer.

> Frontend generated with AI and polished for clean user experience.

---

## 🏁 License

MIT – use it, fork it, star it.

---
