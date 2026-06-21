import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let configService: ConfigService;
  let supabaseService: SupabaseService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    requestPasswordReset: jest.fn(),
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'WEB_URL') return 'http://localhost:3000';
      return null;
    }),
  };

  const mockSupabaseService = {
    getClient: () => ({
      auth: {
        signInWithOAuth: jest.fn(),
        exchangeCodeForSession: jest.fn(),
      },
      from: () => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: JwtAuthGuard, useValue: {} },
        { provide: RefreshTokenGuard, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup', async () => {
      const signupDto = { email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' };
      mockAuthService.signup.mockResolvedValue({ token: 'token', refreshToken: 'token', user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' } });
      await controller.signup(signupDto);
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      mockAuthService.login.mockResolvedValue({ token: 'token', refreshToken: 'token', user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' } });
      await controller.login(loginDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshToken', async () => {
      const refreshTokenDto = { refreshToken: 'token' };
      mockAuthService.refreshToken.mockResolvedValue({ accessToken: 'token', refreshToken: 'token' });
      await controller.refreshToken(refreshTokenDto);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const refreshTokenDto = { refreshToken: 'token' };
      mockAuthService.logout.mockResolvedValue(undefined);
      await controller.logout(refreshTokenDto);
      expect(authService.logout).toHaveBeenCalledWith('token');
    });
  });

  describe('requestPasswordReset', () => {
    it('should call authService.requestPasswordReset', async () => {
      const resetPasswordDto = { email: 'test@example.com' };
      mockAuthService.requestPasswordReset.mockResolvedValue({ message: 'sent' });
      await controller.requestPasswordReset(resetPasswordDto);
      expect(authService.requestPasswordReset).toHaveBeenCalledWith(resetPasswordDto);
    });
  });

  // We'll add more tests for Google OAuth and other methods as needed.
});