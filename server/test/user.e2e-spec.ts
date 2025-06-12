import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { User } from '@prisma/client';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let testUser: Omit<User, 'password'>;
  let authToken: string;

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

    testUser = await authService.register(registerDto);
    const loginResponse = await authService.login({
      email: registerDto.email,
      password: registerDto.password,
    });
    authToken = loginResponse.access_token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: 'test@example.com',
      },
    });
    await app.close();
  });

  describe('/users/me (GET)', () => {
    it('should get current user profile', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.name).toBe('Test User');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });
  });

  describe('/users/me (PATCH)', () => {
    it('should update user profile', () => {
      const updateDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateDto.name);
          expect(res.body.email).toBe(updateDto.email);
        });
    });

    it('should validate update data', () => {
      const invalidDto = {
        email: 'invalid-email',
      };

      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/users/me (DELETE)', () => {
    it('should delete user account', () => {
      return request(app.getHttpServer())
        .delete('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('updated@example.com');
        });
    });

    it('should not allow access after deletion', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });
  });
}); 