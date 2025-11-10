import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RefreshDto, SignupDto } from './dto/auth.dto';

interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  private readonly refreshExpirySeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.refreshSecret = this.config.get('JWT_REFRESH_SECRET') ?? 'refresh-secret';
    const refreshDays = Number(this.config.get('REFRESH_EXPIRES_DAYS') ?? 7);
    this.refreshExpirySeconds = refreshDays * 24 * 60 * 60;
  }

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }
    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, password_hash },
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshDto) {
    try {
      const payload = this.jwt.verify<TokenPayload>(dto.refreshToken, { secret: this.refreshSecret });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException();
      }
      return this.buildAuthResponse(user);
    } catch (err) {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }

  async logout() {
    return { success: true };
  }

  private buildAuthResponse(user: Prisma.UserGetPayload<object>) {
    const tokens = this.issueTokens({ sub: user.id, email: user.email, role: user.role });
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    };
  }

  private issueTokens(payload: TokenPayload) {
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpirySeconds,
    });
    return { accessToken, refreshToken };
  }
}
