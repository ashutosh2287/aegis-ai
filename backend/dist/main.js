"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_pino_1 = require("nestjs-pino");
const config_1 = require("@nestjs/config");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const timeout_interceptor_1 = require("./common/interceptors/timeout.interceptor");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const security_middleware_1 = require("./common/middleware/security.middleware");
const helmet_1 = __importDefault(require("helmet"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(app.get(nestjs_pino_1.Logger)));
    app.useGlobalInterceptors(new timeout_interceptor_1.TimeoutInterceptor(app.get(config_1.ConfigService), app.get(nestjs_pino_1.Logger)));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    const securityMiddleware = new security_middleware_1.SecurityMiddleware(app.get(nestjs_pino_1.Logger));
    app.use(securityMiddleware.use.bind(securityMiddleware));
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "validator.swagger.io"],
                scriptSrc: ["'self'", "https: 'unsafe-inline'"],
            },
        },
    }));
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Aegis AI API')
            .setDescription('The Aegis AI workout tracker API')
            .setVersion('1.0')
            .addTag('workouts')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = configService.get('port') || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map