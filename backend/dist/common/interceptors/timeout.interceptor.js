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
exports.TimeoutInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
let TimeoutInterceptor = class TimeoutInterceptor {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
    }
    intercept(context, next) {
        const timeoutSeconds = this.configService.get('requestTimeout') || 30;
        const timeoutMilliseconds = timeoutSeconds * 1000;
        return next.handle().pipe((0, operators_1.timeout)(timeoutMilliseconds), (0, operators_1.catchError)((err) => {
            if (err instanceof rxjs_1.TimeoutError) {
                this.logger.warn(`Request timeout after ${timeoutSeconds} seconds`, `Timeout on ${context.getType()}`);
                return (0, rxjs_1.throwError)(() => new Error('Request timeout'));
            }
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
};
exports.TimeoutInterceptor = TimeoutInterceptor;
exports.TimeoutInterceptor = TimeoutInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_pino_1.Logger])
], TimeoutInterceptor);
//# sourceMappingURL=timeout.interceptor.js.map