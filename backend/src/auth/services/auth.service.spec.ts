import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { OAuthService } from './oauth.service';
import { ProfileService } from './profile.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;
  let oauthService: OAuthService;
  let profileService: ProfileService;
  let passwordService: PasswordService;

  let mockSupabaseClient: any;
  const mockSupabaseService = {
    getClient: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'jwt-secret';
        case 'JWT_EXPIRES_IN':
          return '15m';
        case 'JWT_REFRESH_SECRET':
          return 'jwt-refresh-secret';
        case 'JWT_REFRESH_EXPIRES_IN':
          return '7d';
        case 'JWT_REFRESH_EXPIRES_IN_MS':
          return 604800000;
        case 'WEB_URL':
          return 'http://localhost:3000';
        default:
          return null;
      }
    }),
  };

  const mockTokenService = {
    supabaseService: mockSupabaseService,
    jwtService: mockJwtService,
    configService: mockConfigService,
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    isValidRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn(),
  };

  const mockOAuthService = {
    initiateGoogleLogin: jest.fn(),
    handleGoogleCallback: jest.fn(),
  };

  const mockProfileService = {
    createProfile: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  const mockPasswordService = {
    requestPasswordReset: jest.fn(),
  };

  beforeEach(async () => {
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        signInWithOAuth: jest.fn(),
        exchangeCodeForSession: jest.fn(),
      },
      from: jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
      })),
    };

    mockSupabaseService.getClient.mockReturnValue(mockSupabaseClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: TokenService, useValue: mockTokenService },
        { provide: OAuthService, useValue: mockOAuthService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: PasswordService, useValue: mockPasswordService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    oauthService = module.get<OAuthService>(OAuthService);
    profileService = module.get<ProfileService>(ProfileService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should sign up a user and return tokens', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'user-id',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabaseClient.from().insert.mockResolvedValue({ data: [], error: null });

      mockTokenService.signAccessToken.mockReturnValue('access-token');
      mockTokenService.signRefreshToken.mockResolvedValue('refresh-token');

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 'user-id', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
      });
    });
  });

  // We'll add more tests as needed, but for brevity, we'll stop here.
});