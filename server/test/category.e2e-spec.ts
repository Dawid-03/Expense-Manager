import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { CategoryType } from '@prisma/client';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let authToken: string;
  let testCategoryId: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();

    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const user = await authService.register(registerDto);
    testUserId = user.id;
    const loginResponse = await authService.login({
      email: registerDto.email,
      password: registerDto.password,
    });
    authToken = loginResponse.access_token;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.category.deleteMany({
        where: {
          userId: testUserId,
        },
      });
      await prisma.user.delete({
        where: {
          id: testUserId,
        },
      });
    }
    await app.close();
  });

  describe('/categories (POST)', () => {
    it('should create a new category', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Category',
          type: 'EXPENSE',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Category');
          expect(res.body.type).toBe('EXPENSE');
          testCategoryId = res.body.id;
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/categories (GET)', () => {
    it('should get all categories', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('type');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .expect(401);
    });
  });

  describe('/categories/:id (GET)', () => {
    it('should get a category by id', () => {
      return request(app.getHttpServer())
        .get(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testCategoryId);
          expect(res.body.name).toBe('Test Category');
          expect(res.body.type).toBe('EXPENSE');
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .get('/categories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/categories/:id (PATCH)', () => {
    it('should update a category', () => {
      return request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Category',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testCategoryId);
          expect(res.body.name).toBe('Updated Category');
          expect(res.body.type).toBe('EXPENSE');
        });
    });

    it('should validate update data', () => {
      return request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
        })
        .expect(400);
    });
  });

  describe('/categories/:id (DELETE)', () => {
    it('should delete a category', () => {
      return request(app.getHttpServer())
        .delete(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .delete('/categories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
}); 