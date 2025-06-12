import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateExpenseDto } from '../src/expense/dto/create-expense.dto';
import { UpdateExpenseDto } from '../src/expense/dto/update-expense.dto';

describe('ExpenseController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testCategoryId: string;
  let testExpenseId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    testUserId = registerResponse.body.id;
    authToken = registerResponse.body.accessToken;

    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Category',
        type: 'EXPENSE',
      });

    testCategoryId = categoryResponse.body.id;
  });

  afterAll(async () => {
    if (testExpenseId) {
      await prisma.expense.delete({
        where: { id: testExpenseId },
      });
    }
    if (testCategoryId) {
      await prisma.category.delete({
        where: { id: testCategoryId },
      });
    }
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
    await app.close();
  });

  describe('/expenses (POST)', () => {
    it('should create an expense', async () => {
      const createDto: CreateExpenseDto = {
        description: 'Test Expense',
        amount: 100,
        date: new Date(),
        categoryId: testCategoryId,
      };

      const response = await request(app.getHttpServer())
        .post('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe(createDto.description);
      expect(response.body.amount).toBe(createDto.amount);
      expect(response.body.categoryId).toBe(testCategoryId);
      expect(response.body.userId).toBe(testUserId);

      testExpenseId = response.body.id;
    });

    it('should return 400 if category does not exist', async () => {
      const createDto: CreateExpenseDto = {
        description: 'Test Expense',
        amount: 100,
        date: new Date(),
        categoryId: 'non-existent-category',
      };

      await request(app.getHttpServer())
        .post('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should return 401 if not authenticated', async () => {
      const createDto: CreateExpenseDto = {
        description: 'Test Expense',
        amount: 100,
        date: new Date(),
        categoryId: testCategoryId,
      };

      await request(app.getHttpServer())
        .post('/expenses')
        .send(createDto)
        .expect(401);
    });
  });

  describe('/expenses (GET)', () => {
    it('should return all expenses for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('amount');
      expect(response.body[0]).toHaveProperty('category');
    });

    it('should filter expenses by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const response = await request(app.getHttpServer())
        .get('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((expense) => {
        const expenseDate = new Date(expense.date);
        expect(expenseDate >= startDate && expenseDate <= endDate).toBe(true);
      });
    });

    it('should filter expenses by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ categoryId: testCategoryId })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((expense) => {
        expect(expense.categoryId).toBe(testCategoryId);
      });
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/expenses').expect(401);
    });
  });

  describe('/expenses/:id (GET)', () => {
    it('should return an expense by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testExpenseId);
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 if expense not found', async () => {
      await request(app.getHttpServer())
        .get('/expenses/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/expenses/${testExpenseId}`)
        .expect(401);
    });
  });

  describe('/expenses/:id (PATCH)', () => {
    it('should update an expense', async () => {
      const updateDto: UpdateExpenseDto = {
        description: 'Updated Expense',
        amount: 200,
      };

      const response = await request(app.getHttpServer())
        .patch(`/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('id', testExpenseId);
      expect(response.body.description).toBe(updateDto.description);
      expect(response.body.amount).toBe(updateDto.amount);
    });

    it('should return 404 if expense not found', async () => {
      const updateDto: UpdateExpenseDto = {
        description: 'Updated Expense',
      };

      await request(app.getHttpServer())
        .patch('/expenses/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      const updateDto: UpdateExpenseDto = {
        description: 'Updated Expense',
      };

      await request(app.getHttpServer())
        .patch(`/expenses/${testExpenseId}`)
        .send(updateDto)
        .expect(401);
    });
  });

  describe('/expenses/:id (DELETE)', () => {
    it('should delete an expense', async () => {
      await request(app.getHttpServer())
        .delete(`/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 if expense not found', async () => {
      await request(app.getHttpServer())
        .delete('/expenses/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/expenses/${testExpenseId}`)
        .expect(401);
    });
  });
}); 