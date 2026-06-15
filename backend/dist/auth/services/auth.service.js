"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const token_service_1 = require("./token.service");
const oauth_service_1 = require("./oauth.service");
const profile_service_1 = require("./profile.service");
const password_service_1 = require("./password.service");
let AuthService = class AuthService {
    constructor(tokenService, oauthService, profileService, passwordService) {
        this.tokenService = tokenService;
        this.oauthService = oauthService;
        this.profileService = profileService;
        this.passwordService = passwordService;
    }
    async signup(signupDto) {
        const { email, password, fullName } = signupDto;
        const { data: authData, error: authError } = await this.tokenService.supabaseService.getClient().auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        if (authError) {
            throw new common_1.InternalServerErrorException(`Failed to create user: ${authError.message}`);
        }
        const user = authData.user;
        if (!user) {
            throw new common_1.InternalServerErrorException('No user returned from Supabase Auth');
        }
        const profileData = {
            id: user.id,
            username: user.email?.split('@')[0] || undefined,
            full_name: fullName || null,
            avatar_url: null,
            bio: null,
            training_years: 0,
            primary_goal: null,
            experience_level: 'beginner',
            preferred_units: 'metric',
            timezone: 'UTC',
            notification_preferences: { email: true, push: true, workout_reminder: true },
        };
        await this.profileService.createProfile(profileData);
        const accessToken = this.tokenService.signAccessToken(user.id);
        const refreshToken = await this.tokenService.signRefreshToken(user.id);
        return { accessToken, refreshToken };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const { data: authData, error: authError } = await this.tokenService.supabaseService.getClient().auth.signInWithPassword({
            email,
            password,
        });
        if (authError) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const user = authData.user;
        if (!user) {
            throw new common_1.InternalServerErrorException('No user returned from Supabase Auth');
        }
        const profile = await this.profileService.getProfile(user.id);
        const accessToken = this.tokenService.signAccessToken(user.id);
        const refreshToken = await this.tokenService.signRefreshToken(user.id);
        return { accessToken, refreshToken };
    }
    async refreshToken(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        let payload;
        try {
            payload = await this.tokenService.jwtService.verifyAsync(refreshToken, {
                secret: this.tokenService.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const userId = payload.sub;
        if (!userId) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const isValid = await this.tokenService.isValidRefreshToken(userId, refreshToken);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const newAccessToken = this.tokenService.signAccessToken(userId);
        const newRefreshToken = await this.tokenService.signRefreshToken(userId);
        await this.tokenService.removeRefreshToken(refreshToken);
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    async logout(refreshToken) {
        await this.tokenService.removeRefreshToken(refreshToken);
    }
    async requestPasswordReset(resetPasswordDto) {
        return this.passwordService.requestPasswordReset(resetPasswordDto.email);
    }
    async getProfile(userId) {
        return this.profileService.getProfile(userId);
    }
    async updateProfile(userId, updateProfileDto) {
        return this.profileService.updateProfile(userId, updateProfileDto);
    }
    async initiateGoogleLogin() {
        return this.oauthService.initiateGoogleLogin();
    }
    async handleGoogleCallback(code) {
        const { user } = await this.oauthService.handleGoogleCallback(code);
        let profile = await this.profileService.getProfile(user.id).catch(() => null);
        if (!profile) {
            const profileData = {
                id: user.id,
                username: user.email?.split('@')[0] || undefined,
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
                bio: null,
                training_years: 0,
                primary_goal: null,
                experience_level: 'beginner',
                preferred_units: 'metric',
                timezone: 'UTC',
                notification_preferences: { email: true, push: true, workout_reminder: true },
            };
            profile = await this.profileService.createProfile(profileData);
        }
        const accessToken = this.tokenService.signAccessToken(user.id);
        const refreshToken = await this.tokenService.signRefreshToken(user.id);
        return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        oauth_service_1.OAuthService,
        profile_service_1.ProfileService,
        password_service_1.PasswordService])
], AuthService);
//# sourceMappingURL=auth.service.js.map