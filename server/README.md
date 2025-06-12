# Expense Manager API

A RESTful API for managing personal expenses and income, built with NestJS, PostgreSQL, and Prisma.

## Features

- User authentication (JWT-based)
- Expense and income tracking
- Category management
- Reports and analytics
- PostgreSQL database with Prisma ORM

## Prerequisites

- Node.js (v20 or later)
- PostgreSQL
- npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-manager-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following content:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_manager?schema=public"
JWT_SECRET="your-super-secret-jwt-key-that-should-be-changed-in-production"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create a new category
- `PUT /categories/:id` - Update a category
- `DELETE /categories/:id` - Delete a category

### Expenses
- `GET /expenses` - Get all expenses
- `POST /expenses` - Create a new expense
- `PUT /expenses/:id` - Update an expense
- `DELETE /expenses/:id` - Delete an expense

### Income
- `GET /income` - Get all income entries
- `POST /income` - Create a new income entry
- `PUT /income/:id` - Update an income entry
- `DELETE /income/:id` - Delete an income entry

### Reports
- `GET /reports/monthly` - Get monthly expense/income report
- `GET /reports/by-category` - Get expenses grouped by category

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## License

MIT 