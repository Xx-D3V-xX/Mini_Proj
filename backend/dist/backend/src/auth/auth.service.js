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
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        var _a, _b;
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.refreshSecret = (_a = this.config.get('JWT_REFRESH_SECRET')) !== null && _a !== void 0 ? _a : 'refresh-secret';
        const refreshDays = Number((_b = this.config.get('REFRESH_EXPIRES_DAYS')) !== null && _b !== void 0 ? _b : 7);
        this.refreshExpirySeconds = refreshDays * 24 * 60 * 60;
    }
    async signup(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.UnauthorizedException('Email already registered');
        }
        const password_hash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: { email: dto.email, name: dto.name, password_hash },
        });
        return this.buildAuthResponse(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(dto.password, user.password_hash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.buildAuthResponse(user);
    }
    async refresh(dto) {
        try {
            const payload = this.jwt.verify(dto.refreshToken, { secret: this.refreshSecret });
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user) {
                throw new common_1.UnauthorizedException();
            }
            return this.buildAuthResponse(user);
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Refresh token invalid');
        }
    }
    async logout() {
        return { success: true };
    }
    buildAuthResponse(user) {
        const tokens = this.issueTokens({ sub: user.id, email: user.email, role: user.role });
        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            ...tokens,
        };
    }
    issueTokens(payload) {
        const accessToken = this.jwt.sign(payload);
        const refreshToken = this.jwt.sign(payload, {
            secret: this.refreshSecret,
            expiresIn: this.refreshExpirySeconds,
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map