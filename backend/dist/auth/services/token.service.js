"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("../../supabase/supabase.service");
const bcrypt = __importStar(require("bcrypt"));
let TokenService = class TokenService {
    constructor(jwtService, configService, supabaseService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.supabaseService = supabaseService;
    }
    signAccessToken(userId) {
        return this.jwtService.sign({ sub: userId }, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRES_IN'),
        });
    }
    async signRefreshToken(userId) {
        const refreshToken = this.jwtService.sign({ sub: userId }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
        });
        const tokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresInMs = this.configService.get('JWT_REFRESH_EXPIRES_IN_MS') || 7 * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + expiresInMs).toISOString();
        const { error } = await this.supabaseService
            .getClient()
            .from('refresh_tokens')
            .insert({
            user_id: userId,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to store refresh token: ${error.message}`);
        }
        return refreshToken;
    }
    async verifyRefreshToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            return { userId: payload.sub };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async isValidRefreshToken(userId, refreshToken) {
        const tokenHash = await bcrypt.hash(refreshToken, 10);
        const { data, error } = await this.supabaseService
            .getClient()
            .from('refresh_tokens')
            .select('*')
            .eq('user_id', userId)
            .eq('token_hash', tokenHash)
            .gt('expires_at', new Date().toISOString())
            .single();
        return !error && !!data;
    }
    async removeRefreshToken(refreshToken) {
        const tokenHash = await bcrypt.hash(refreshToken, 10);
        const { error } = await this.supabaseService
            .getClient()
            .from('refresh_tokens')
            .delete()
            .eq('token_hash', tokenHash);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to remove refresh token: ${error.message}`);
        }
    }
    async hashToken(token) {
        return bcrypt.hash(token, 10);
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        supabase_service_1.SupabaseService])
], TokenService);
//# sourceMappingURL=token.service.js.map