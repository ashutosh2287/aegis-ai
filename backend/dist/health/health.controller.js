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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("../supabase/supabase.service");
const nestjs_pino_1 = require("nestjs-pino");
let HealthController = class HealthController {
    constructor(health, configService, supabaseService, logger) {
        this.health = health;
        this.configService = configService;
        this.supabaseService = supabaseService;
        this.logger = logger;
    }
    check() {
        return this.health.check([
            async () => {
                try {
                    const { data, error } = await this.supabaseService
                        .getClient()
                        .from('profiles')
                        .select('count')
                        .limit(1);
                    if (error) {
                        throw error;
                    }
                    return { supabase: { status: 'up' } };
                }
                catch (err) {
                    this.logger.error(err, 'Supabase health check failed');
                    return { supabase: { status: 'down' } };
                }
            },
        ]);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        config_1.ConfigService,
        supabase_service_1.SupabaseService,
        nestjs_pino_1.Logger])
], HealthController);
//# sourceMappingURL=health.controller.js.map