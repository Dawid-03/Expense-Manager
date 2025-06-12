import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('ReportsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      },
    });
    userId = user.id;

    authToken = jwtService.sign({ sub: user.id, email: user.email });
  });

  afterAll(async () => {
    await prisma.expense.deleteMany({
      where: { userId },
    });
    await prisma.income.deleteMany({
      where: { userId },
    });
    await prisma.category.deleteMany({
      where: { userId },
    });
    await prisma.user.delete({
      where: { id: userId },
    });

    await app.close();
  });

  beforeEach(async () => {
    const expenseCategory = await prisma.category.create({
      data: {
        name: 'Test Expense Category',
        type: 'EXPENSE',
        userId,
      },
    });

    const incomeCategory = await prisma.category.create({
      data: {
        name: 'Test Income Category',
        type: 'INCOME',
        userId,
      },
    });

    await prisma.expense.create({
      data: {
        description: 'Test Expense 1',
        amount: 100,
        date: new Date('2024-03-01'),
        userId,
        categoryId: expenseCategory.id,
      },
    });

    await prisma.expense.create({
      data: {
        description: 'Test Expense 2',
        amount: 200,
        date: new Date('2024-03-02'),
        userId,
        categoryId: expenseCategory.id,
      },
    });

    await prisma.income.create({
      data: {
        description: 'Test Income',
        amount: 500,
        date: new Date('2024-03-01'),
        userId,
        categoryId: incomeCategory.id,
      },
    });
  });

  afterEach(async () => {
    await prisma.expense.deleteMany({
      where: { userId },
    });
    await prisma.income.deleteMany({
      where: { userId },
    });
    await prisma.category.deleteMany({
      where: { userId },
    });
  });

  describe('/reports/monthly-totals (GET)', () => {
    it('should return monthly totals', () => {
      return request(app.getHttpServer())
        .get('/reports/monthly-totals')
        .query({ year: 2024, month: 3 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('month', 3);
          expect(res.body).toHaveProperty('year', 2024);
          expect(res.body).toHaveProperty('totalExpenses', 300);
          expect(res.body).toHaveProperty('totalIncomes', 500);
          expect(res.body).toHaveProperty('balance', 200);
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/reports/monthly-totals')
        .query({ year: 2024, month: 3 })
        .expect(401);
    });
  });

  describe('/reports/expenses-by-category (GET)', () => {
    it('should return expenses grouped by category', () => {
      return request(app.getHttpServer())
        .get('/reports/expenses-by-category')
        .query({ year: 2024, month: 3 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('category');
          expect(res.body[0]).toHaveProperty('total');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/reports/expenses-by-category')
        .query({ year: 2024, month: 3 })
        .expect(401);
    });
  });

  describe('/reports/balance-overview (GET)', () => {
    it('should return balance overview', () => {
      return request(app.getHttpServer())
        .get('/reports/balance-overview')
        .query({ year: 2024, month: 3 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('month', 3);
          expect(res.body).toHaveProperty('year', 2024);
          expect(res.body).toHaveProperty('balanceHistory');
          expect(res.body).toHaveProperty('totalExpenses', 300);
          expect(res.body).toHaveProperty('totalIncomes', 500);
          expect(res.body).toHaveProperty('currentBalance', 200);
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/reports/balance-overview')
        .query({ year: 2024, month: 3 })
        .expect(401);
    });
  });
}); 