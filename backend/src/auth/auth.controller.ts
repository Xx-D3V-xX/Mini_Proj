import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { AppConfigService } from '../common/config';
import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, SignupDto, loginSchema, refreshSchema, signupSchema } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly appConfig: AppConfigService) {}

  @Post('signup')
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(dto);
    this.attachCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.attachCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('refresh')
  async refresh(
    @Body(new ZodValidationPipe(refreshSchema)) dto: RefreshDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(dto);
    this.attachCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    if (this.appConfig.useAuthCookies) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
    }
    return this.authService.logout();
  }

  private attachCookies(res: Response, accessToken: string, refreshToken: string) {
    if (!this.appConfig.useAuthCookies) {
      return;
    }
    const options = this.appConfig.cookieOptions();
    res.cookie('access_token', accessToken, options);
    res.cookie('refresh_token', refreshToken, { ...options, maxAge: 1000 * 60 * 60 * 24 * 7 });
  }
}
