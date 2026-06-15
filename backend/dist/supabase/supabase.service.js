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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
let SupabaseService = class SupabaseService {
    constructor(supabaseClient, configService, logger) {
        this.supabaseClient = supabaseClient;
        this.configService = configService;
        this.logger = logger;
    }
    onModuleInit() {
        this.logger.log('Supabase client initialized');
    }
    onModuleDestroy() {
        this.logger.log('Supabase client destroyed');
    }
    getClient() {
        return this.supabaseClient;
    }
    realtime(tableName, callback) {
        return this.supabaseClient
            .channel(`public:${tableName}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
            .subscribe();
    }
    getSupabaseUrl() {
        const url = this.configService.get('SUPABASE_URL');
        if (!url) {
            throw new Error('SUPABASE_URL is not defined');
        }
        return url;
    }
    getSupabaseAnonKey() {
        const key = this.configService.get('SUPABASE_ANON_KEY');
        if (!key) {
            throw new Error('SUPABASE_ANON_KEY is not defined');
        }
        return key;
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [Object, config_1.ConfigService,
        nestjs_pino_1.Logger])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map