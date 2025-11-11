"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const exceptions_1 = require("./common/exceptions");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    var _a, _b;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    const configService = app.get(config_1.ConfigService);
    const normalizeOrigin = (value) => value.replace(/\/+$/, '');
    const originEnv = (_a = configService.get('CORS_ORIGIN')) !== null && _a !== void 0 ? _a : 'http://localhost:5173';
    const allowedOrigins = originEnv
        .split(/[,\s]+/)
        .map((value) => normalizeOrigin(value.trim()))
        .filter(Boolean);
    const allowAllOrigins = allowedOrigins.includes('*');
    app.use(cookieParser());
    app.enableCors({
        origin: (requestOrigin, callback) => {
            const normalizedRequestOrigin = requestOrigin ? normalizeOrigin(requestOrigin) : undefined;
            if (!requestOrigin && allowedOrigins.length === 1 && !allowAllOrigins) {
                return callback(null, allowedOrigins[0]);
            }
            if (allowAllOrigins ||
                !normalizedRequestOrigin ||
                allowedOrigins.some((origin) => origin === normalizedRequestOrigin)) {
                const responseOrigin = requestOrigin !== null && requestOrigin !== void 0 ? requestOrigin : allowedOrigins[0];
                return callback(null, responseOrigin);
            }
            return callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
        },
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
        optionsSuccessStatus: 204,
    });
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new exceptions_1.HttpExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('MumbAI Trails API')
        .setDescription('NestJS backend powering MumbAI Trails')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = (_b = configService.get('PORT')) !== null && _b !== void 0 ? _b : 4000;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map