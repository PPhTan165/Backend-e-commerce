import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '../refresh-token/refresh.entity';
import { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(
    username: string,
    email: string,
    password: string,
    fullname: string,
  ) {
    const existingEmail = await this.usersService.findByEmail(email);
    const existingUsername = await this.usersService.findByUsername(username);
    if (existingEmail || existingUsername) {
      throw new BadRequestException(`Email hoặc username đã tồn tại`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.usersService.create({
      username,
      email,
      password: hashedPassword,
      fullname,
    });

    return {
      message: 'Tạo tài khoản thành công',
    };
  }

  async login(username: string, password: string, res: Response) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Mật khẩu không đúng');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const { accessToken, refreshToken } = await this.generateTokens(user);

    await this.saveRefreshToken(user, refreshToken);

    try {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth/refresh',
      });
    } catch (error) {}

    return {
      accessToken,
    };
  }

  //   async refresh(
  //     userId: number,
  //     refreshToken: string,
  //   ): Promise<{ accessToken: string; refreshToken: string }> {
  //     try {
  //       this.jwtService.verify(refreshToken, {
  //         secret: process.env.JWT_REFRESH_SECRET,
  //       });
  //     } catch (error) {
  //       throw new UnauthorizedException('Refresh token không hợp lệ');
  //     }

  //     const tokens = await this.refreshTokenRepo.find({
  //       where: {
  //         user: { id: userId },
  //         isRevoked: false,
  //       },
  //     });

  //     if (!tokens.length) {
  //       throw new UnauthorizedException('Không có refresh token hợp lệ');
  //     }

  //     let matchedToken: RefreshToken | null = null;

  //     for (const token of tokens) {
  //       const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
  //       if (isMatch) {
  //         matchedToken = token;
  //         break;
  //       }
  //     }

  //     if (!matchedToken) {
  //       throw new UnauthorizedException('Refresh token đã hết hạn');
  //     }

  //     matchedToken.isRevoked = true;
  //     await this.refreshTokenRepo.save(matchedToken);

  //     const payload = { sub: userId };

  //     const accessToken = this.jwtService.sign(payload, {
  //       secret: process.env.JWT_ACCESS_SECRET,
  //       expiresIn: '15m',
  //     });

  //     const newRefreshToken = this.jwtService.sign(payload, {
  //       secret: process.env.JWT_REFRESH_SECRET,
  //       expiresIn: '7d',
  //     });

  //     await this.saveRefreshToken((userId), newRefreshToken);
  //   }

  private async findMatchingToken(
    refreshToken: string,
    records: RefreshToken[],
  ) {
    for (const record of records) {
      const isMatch = await bcrypt.compare(refreshToken, record.tokenHash);
      if (isMatch) return record;
    }
    return null;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(user: User, token: string) {
    const hashed = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.refreshTokenRepo.save({
      user,
      tokenHash: hashed,
      expiresAt,
    });
  }
}
