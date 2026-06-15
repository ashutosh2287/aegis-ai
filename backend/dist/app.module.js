"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const terminus_1 = require("@nestjs/terminus");
const supabase_module_1 = require("./supabase/supabase.module");
const auth_module_1 = require("./auth/auth.module");
const health_controller_1 = require("./health/health.controller");
const throttler_1 = require("@nestjs/throttler");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const config_validation_1 = require("./config/config.validation");
const exercise_module_1 = require("./exercise/exercise.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.development.local', '.env.development', '.env'],
                validationSchema: config_validation_1.configValidationSchema,
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => [{
                        ttl: config.get('throttle.ttl') ?? 60,
                        limit: config.get('throttle.limit') || 10,
                    }],
            }),
            terminus_1.TerminusModule,
            supabase_module_1.SupabaseModule,
            auth_module_1.AuthModule,
            exercise_module_1.ExerciseModule,
            serve_static_1.ServeStaticModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => [{
                        rootPath: (0, path_1.join)(__dirname, '..', config.get('upload.dir') ?? 'uploads'),
                        serveRoot: '/uploads',
                    }],
            }),
        ],
        controllers: [health_controller_1.HealthController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map