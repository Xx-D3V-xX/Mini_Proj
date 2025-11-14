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
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    const configService = app.get(config_1.ConfigService);
    app.use(cookieParser());
    app.enableCors({
        origin: ['http://localhost:5173'],
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
        optionsSuccessStatus: 204,
    });
    app.setGlobalPrefix('api', {
        exclude: ['docs', 'docs/(.*)'],
    });
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
    const port = (_a = configService.get('PORT')) !== null && _a !== void 0 ? _a : 4000;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map