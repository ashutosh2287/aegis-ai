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
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = class AuthService {
    constructor(jwtService, configService, supabaseService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.supabaseService = supabaseService;
    }
    signAccessToken(userId) {
        return this.jwtService.sign({ sub: userId }, {
            expiresIn: this.configService.get('JWT_EXPIRES_IN'),
        });
    }
    signRefreshToken(userId) {
        return this.jwtService.sign({ sub: userId }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
        });
    }
    async verifyRefreshToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            return { userId: payload.sub };
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid or expired refresh token');
        }
    }
    decodeToken(token) {
        return this.jwtService.decode(token);
    }
    async validateUser(email, password) {
        throw new Error('User validation not implemented in foundation');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map