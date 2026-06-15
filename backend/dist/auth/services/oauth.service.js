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
exports.OAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("../../supabase/supabase.service");
let OAuthService = class OAuthService {
    constructor(configService, supabaseService) {
        this.configService = configService;
        this.supabaseService = supabaseService;
    }
    async initiateGoogleLogin() {
        const { data, error } = await this.supabaseService
            .getClient()
            .auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${this.configService.get('WEB_URL')}/auth/google/callback`,
            },
        });
        if (error) {
            throw new common_1.InternalServerErrorException(`Google OAuth failed: ${error.message}`);
        }
        return { url: data.url };
    }
    async handleGoogleCallback(code) {
        const { data: authData, error: authError } = await this.supabaseService
            .getClient()
            .auth.exchangeCodeForSession(code);
        if (authError) {
            throw new common_1.InternalServerErrorException(`Google OAuth failed: ${authError.message}`);
        }
        const user = authData.user;
        if (!user) {
            throw new common_1.InternalServerErrorException('No user returned from Google OAuth');
        }
        return { user };
    }
};
exports.OAuthService = OAuthService;
exports.OAuthService = OAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        supabase_service_1.SupabaseService])
], OAuthService);
//# sourceMappingURL=oauth.service.js.map