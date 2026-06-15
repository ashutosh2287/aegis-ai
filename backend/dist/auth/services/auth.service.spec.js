"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const token_service_1 = require("./token.service");
const oauth_service_1 = require("./oauth.service");
const profile_service_1 = require("./profile.service");
const password_service_1 = require("./password.service");
describe('AuthService', () => {
    let service;
    let tokenService;
    let oauthService;
    let profileService;
    let passwordService;
    let mockSupabaseClient;
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: token_service_1.TokenService, useValue: mockTokenService },
                { provide: oauth_service_1.OAuthService, useValue: mockOAuthService },
                { provide: profile_service_1.ProfileService, useValue: mockProfileService },
                { provide: password_service_1.PasswordService, useValue: mockPasswordService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        tokenService = module.get(token_service_1.TokenService);
        oauthService = module.get(oauth_service_1.OAuthService);
        profileService = module.get(profile_service_1.ProfileService);
        passwordService = module.get(password_service_1.PasswordService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('signup', () => {
        it('should sign up a user and return tokens', async () => {
            const signupDto = {
                email: 'test@example.com',
                password: 'password123',
                fullName: 'Test User',
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
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            });
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map