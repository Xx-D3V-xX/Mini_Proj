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
exports.AppConfigModule = exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = class AppConfigService {
    constructor(config) {
        this.config = config;
    }
    get port() {
        var _a;
        return Number((_a = this.config.get('PORT')) !== null && _a !== void 0 ? _a : 4000);
    }
    get corsOrigin() {
        var _a;
        return (_a = this.config.get('CORS_ORIGIN')) !== null && _a !== void 0 ? _a : 'http://localhost:5173';
    }
    get useAuthCookies() {
        var _a;
        return ((_a = this.config.get('USE_AUTH_COOKIES')) !== null && _a !== void 0 ? _a : 'true') === 'true';
    }
    get aiBaseUrl() {
        var _a;
        return (_a = this.config.get('AI_BASE_URL')) !== null && _a !== void 0 ? _a : 'http://localhost:8001';
    }
    cookieOptions() {
        return {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        };
    }
    corsOptions() {
        return {
            origin: this.corsOrigin,
            credentials: this.useAuthCookies,
        };
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
let AppConfigModule = class AppConfigModule {
};
exports.AppConfigModule = AppConfigModule;
exports.AppConfigModule = AppConfigModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [AppConfigService],
        exports: [AppConfigService],
    })
], AppConfigModule);
//# sourceMappingURL=config.js.map