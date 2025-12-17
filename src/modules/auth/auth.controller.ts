import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { access } from 'fs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.username,
      dto.email,
      dto.password,
      dto.fullname,
    );
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      dto.username,
      dto.password,
      res,
    );

    return {
      accessToken: result.accessToken,
    };
  }

//   @Post('refresh')
//   async refresh(
//     @Req() req: Request,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     const refreshToken = req.cookies?.refresh_token;

//     if (!refreshToken) {
//       throw new UnauthorizedException('Không có Refresh token');
//     }

//     const result = await this.authService.refresh(refreshToken);

//     res.cookie('refresh_token', result.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/auth/refresh',
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
//     });

//     return {
//       accessToken: result.accessToken,
//     };
//   }
}
