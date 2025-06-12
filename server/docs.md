# Expense Manager API Documentation

## Health

### Check API Health
- **GET** `/health`
- **Description**: Check API health status
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-03-20T12:00:00.000Z"
  }
  ```

## Authentication

### Register
- **POST** `/auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: 
  ```json
  {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "createdAt": "string",
      "updatedAt": "string"
    },
    "access_token": "string"
  }
  ```

### Login
- **POST** `/auth/login`
- **Description**: Login with existing credentials
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: 
  ```json
  {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "createdAt": "string",
      "updatedAt": "string"
    },
    "access_token": "string"
  }
  ```

## Users

### Get Current User
- **GET** `/users/me`
- **Description**: Get current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Update Current User
- **PATCH** `/users/me`
- **Description**: Update current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Delete Current User
- **DELETE** `/users/me`
- **Description**: Delete current user
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Deleted user object

## Categories

### Create Category
- **POST** `/categories`
- **Description**: Create a new category
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Groceries",
    "type": "EXPENSE"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "EXPENSE" | "INCOME",
    "userId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Get All Categories
- **GET** `/categories`
- **Description**: Get all categories for current user
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `type`: "EXPENSE" | "INCOME" (optional)
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "type": "EXPENSE" | "INCOME",
      "userId": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Get Category by ID
- **GET** `/categories/:id`
- **Description**: Get category by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "EXPENSE" | "INCOME",
    "userId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Update Category
- **PATCH** `/categories/:id`
- **Description**: Update category
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "type": "EXPENSE" | "INCOME"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "type": "EXPENSE" | "INCOME",
    "userId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Delete Category
- **DELETE** `/categories/:id`
- **Description**: Delete category
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Deleted category object

## Expenses

### Create Expense
- **POST** `/expenses`
- **Description**: Create a new expense
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "description": "Grocery shopping",
    "amount": 50.99,
    "date": "2024-03-20",
    "categoryId": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "description": "string",
    "amount": "number",
    "date": "string",
    "categoryId": "string",
    "userId": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "category": {
      "id": "string",
      "name": "string",
      "type": "EXPENSE"
    }
  }
  ```

### Get All Expenses
- **GET** `/expenses`
- **Description**: Get all expenses with optional filters
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `startDate`: ISO date string (optional)
  - `endDate`: ISO date string (optional)
  - `categoryId`: string (optional)
  - `minAmount`: number (optional)
  - `maxAmount`: number (optional)
- **Response**:
  ```json
  [
    {
      "id": "string",
      "description": "string",
      "amount": "number",
      "date": "string",
      "categoryId": "string",
      "userId": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "category": {
        "id": "string",
        "name": "string",
        "type": "EXPENSE"
      }
    }
  ]
  ```

### Get Expense by ID
- **GET** `/expenses/:id`
- **Description**: Get expense by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Single expense object with category

### Update Expense
- **PATCH** `/expenses/:id`
- **Description**: Update expense
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "description": "string",
    "amount": "number",
    "date": "string (ISO date)",
    "categoryId": "string"
  }
  ```
- **Response**: Updated expense object with category

### Delete Expense
- **DELETE** `/expenses/:id`
- **Description**: Delete expense
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Deleted expense object

## Incomes

### Create Income
- **POST** `/incomes`
- **Description**: Create a new income
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "description": "Salary",
    "amount": 3000.00,
    "date": "2024-03-20",
    "categoryId": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "description": "string",
    "amount": "number",
    "date": "string",
    "categoryId": "string",
    "userId": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "category": {
      "id": "string",
      "name": "string",
      "type": "INCOME"
    }
  }
  ```

### Get All Incomes
- **GET** `/incomes`
- **Description**: Get all incomes with optional filters
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `startDate`: ISO date string (optional)
  - `endDate`: ISO date string (optional)
  - `categoryId`: string (optional)
  - `minAmount`: number (optional)
  - `maxAmount`: number (optional)
- **Response**:
  ```json
  [
    {
      "id": "string",
      "description": "string",
      "amount": "number",
      "date": "string",
      "categoryId": "string",
      "userId": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "category": {
        "id": "string",
        "name": "string",
        "type": "INCOME"
      }
    }
  ]
  ```

### Get Income by ID
- **GET** `/incomes/:id`
- **Description**: Get income by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Single income object with category

### Update Income
- **PATCH** `/incomes/:id`
- **Description**: Update income
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "description": "string",
    "amount": "number",
    "date": "string (ISO date)",
    "categoryId": "string"
  }
  ```
- **Response**: Updated income object with category

### Delete Income
- **DELETE** `/incomes/:id`
- **Description**: Delete income
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Deleted income object

## Reports

### Get Monthly Report
- **GET** `/reports/monthly-totals`
- **Description**: Get monthly totals for expenses and incomes
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `year`: number
  - `month`: number (1-12)
- **Response**:
  ```json
  {
    "month": "number",
    "year": "number",
    "totalExpenses": "number",
    "totalIncomes": "number",
    "categoryTotals": {
      "expenses": [
        {
          "name": "string",
          "total": "number"
        }
      ],
      "incomes": [
        {
          "name": "string",
          "total": "number"
        }
      ]
    },
    "dailyBalances": [
      {
        "date": "string (YYYY-MM-DD)",
        "balance": "number"
      }
    ]
  }
  ```

### Get Expenses by Category
- **GET** `/reports/expenses-by-category`
- **Description**: Get expenses grouped by category
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `year`: number
  - `month`: number (1-12)
- **Response**: Same as monthly report

### Get Balance Overview
- **GET** `/reports/balance-overview`
- **Description**: Get detailed balance overview
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `year`: number
  - `month`: number (1-12)
- **Response**: Same as monthly report

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["string"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "string",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "string",
  "error": "Conflict"
}
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is obtained after successful login or registration. 