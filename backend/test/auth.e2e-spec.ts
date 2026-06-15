import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let testEmail: string;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    testEmail = `e2e_test_${Date.now()}@example.com`;

    // Signup a user
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: testEmail,
        password: 'password123',
        fullName: 'E2E Test User',
      })
      .expect(201);

    accessToken = signupRes.body.accessToken;
    refreshToken = signupRes.body.refreshToken;

    // Get the user ID from the profile endpoint
    const profileRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    userId = profileRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) - should login the user and return tokens', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'password123',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });

  it('/auth/refresh (POST) - should refresh the access token', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
        // Update the tokens for subsequent tests if needed
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      });
  });

  it('/auth/me (GET) - should get the user profile', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', userId);
        expect(res.body).toHaveProperty('email', testEmail);
      });
  });

  it('/auth/profile (PATCH) - should update the user profile', () => {
    return request(app.getHttpServer())
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fullName: 'Updated Full Name',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('fullName', 'Updated Full Name');
      });
  });

  it('/auth/logout (POST) - should log out the user', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        refreshToken,
      })
      .expect(200);
  });

  // After logout, the refresh token should be invalid
  it('/auth/refresh (POST) - should fail to refresh after logout', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken, // This is the old refresh token that was logged out
      })
      .expect(401);
  });
});