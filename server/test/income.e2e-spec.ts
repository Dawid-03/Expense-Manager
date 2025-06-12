import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateIncomeDto } from '../src/income/dto/create-income.dto';
import { UpdateIncomeDto } from '../src/income/dto/update-income.dto';

describe('IncomeController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testCategoryId: string;
  let testIncomeId: string;

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
        type: 'INCOME',
      });

    testCategoryId = categoryResponse.body.id;
  });

  afterAll(async () => {
    if (testIncomeId) {
      await prisma.income.delete({
        where: { id: testIncomeId },
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

  describe('/incomes (POST)', () => {
    it('should create an income', async () => {
      const createDto: CreateIncomeDto = {
        description: 'Test Income',
        amount: 100,
        date: new Date(),
        categoryId: testCategoryId,
      };

      const response = await request(app.getHttpServer())
        .post('/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe(createDto.description);
      expect(response.body.amount).toBe(createDto.amount);
      expect(response.body.categoryId).toBe(testCategoryId);
      expect(response.body.userId).toBe(testUserId);

      testIncomeId = response.body.id;
    });

    it('should return 400 if category does not exist', async () => {
      const createDto: CreateIncomeDto = {
        description: 'Test Income',
        amount: 100,
        date: new Date(),
        categoryId: 'non-existent-category',
      };

      await request(app.getHttpServer())
        .post('/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should return 401 if not authenticated', async () => {
      const createDto: CreateIncomeDto = {
        description: 'Test Income',
        amount: 100,
        date: new Date(),
        categoryId: testCategoryId,
      };

      await request(app.getHttpServer())
        .post('/incomes')
        .send(createDto)
        .expect(401);
    });
  });

  describe('/incomes (GET)', () => {
    it('should return all incomes for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('amount');
      expect(response.body[0]).toHaveProperty('category');
    });

    it('should filter incomes by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const response = await request(app.getHttpServer())
        .get('/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((income) => {
        const incomeDate = new Date(income.date);
        expect(incomeDate >= startDate && incomeDate <= endDate).toBe(true);
      });
    });

    it('should filter incomes by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ categoryId: testCategoryId })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((income) => {
        expect(income.categoryId).toBe(testCategoryId);
      });
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/incomes').expect(401);
    });
  });

  describe('/incomes/:id (GET)', () => {
    it('should return an income by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/incomes/${testIncomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testIncomeId);
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 if income not found', async () => {
      await request(app.getHttpServer())
        .get('/incomes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/incomes/${testIncomeId}`)
        .expect(401);
    });
  });

  describe('/incomes/:id (PATCH)', () => {
    it('should update an income', async () => {
      const updateDto: UpdateIncomeDto = {
        description: 'Updated Income',
        amount: 200,
      };

      const response = await request(app.getHttpServer())
        .patch(`/incomes/${testIncomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('id', testIncomeId);
      expect(response.body.description).toBe(updateDto.description);
      expect(response.body.amount).toBe(updateDto.amount);
    });

    it('should return 404 if income not found', async () => {
      const updateDto: UpdateIncomeDto = {
        description: 'Updated Income',
      };

      await request(app.getHttpServer())
        .patch('/incomes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      const updateDto: UpdateIncomeDto = {
        description: 'Updated Income',
      };

      await request(app.getHttpServer())
        .patch(`/incomes/${testIncomeId}`)
        .send(updateDto)
        .expect(401);
    });
  });

  describe('/incomes/:id (DELETE)', () => {
    it('should delete an income', async () => {
      await request(app.getHttpServer())
        .delete(`/incomes/${testIncomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/incomes/${testIncomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 if income not found', async () => {
      await request(app.getHttpServer())
        .delete('/incomes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/incomes/${testIncomeId}`)
        .expect(401);
    });
  });
}); 