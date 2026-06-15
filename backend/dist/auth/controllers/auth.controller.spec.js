"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("../services/auth.service");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("../../supabase/supabase.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const refresh_token_guard_1 = require("../guards/refresh-token.guard");
describe('AuthController', () => {
    let controller;
    let authService;
    let configService;
    let supabaseService;
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
            if (key === 'WEB_URL')
                return 'http://localhost:3000';
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
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                { provide: auth_service_1.AuthService, useValue: mockAuthService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
                { provide: supabase_service_1.SupabaseService, useValue: mockSupabaseService },
                { provide: jwt_auth_guard_1.JwtAuthGuard, useValue: {} },
                { provide: refresh_token_guard_1.RefreshTokenGuard, useValue: {} },
            ],
        }).compile();
        controller = module.get(auth_controller_1.AuthController);
        authService = module.get(auth_service_1.AuthService);
        configService = module.get(config_1.ConfigService);
        supabaseService = module.get(supabase_service_1.SupabaseService);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('signup', () => {
        it('should call authService.signup', async () => {
            const signupDto = { email: 'test@example.com', password: 'password123' };
            mockAuthService.signup.mockResolvedValue({ accessToken: 'token', refreshToken: 'token' });
            await controller.signup(signupDto);
            expect(authService.signup).toHaveBeenCalledWith(signupDto);
        });
    });
    describe('login', () => {
        it('should call authService.login', async () => {
            const loginDto = { email: 'test@example.com', password: 'password123' };
            mockAuthService.login.mockResolvedValue({ accessToken: 'token', refreshToken: 'token' });
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
});
//# sourceMappingURL=auth.controller.spec.js.map