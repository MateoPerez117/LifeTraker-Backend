import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async hash(data: string) {
    return bcrypt.hash(data, 10);
  }

  private async getTokens(payload: JwtPayload): Promise<Tokens> {
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn:'15m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hash = await this.hash(refreshToken);
    const expiresAt = new Date();
    // 7 días por default; si usas otra TTL, ajusta
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hash,
        expiresAt,
      },
    });
  }

  private getPublicUser(user: { id: string; email: string; username: string; createdAt: Date; updatedAt: Date }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existing) {
      throw new BadRequestException('Email o username ya están en uso');
    }

    const passwordHash = await this.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const tokens = await this.getTokens(payload);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.getPublicUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const tokens = await this.getTokens(payload);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.getPublicUser(user),
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<Tokens> {
    const { refreshToken } = dto;

    let payload: JwtPayload & { iat: number; exp: number };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (e) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const now = new Date();

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        expiresAt: { gt: now },
      },
    });

    let match = false;
    for (const t of storedTokens) {
      const isSame = await bcrypt.compare(refreshToken, t.tokenHash);
      if (isSame) {
        match = true;
        break;
      }
    }

    if (!match) {
      throw new UnauthorizedException('Refresh token no reconocido');
    }

    const newTokens = await this.getTokens({
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
    });

    await this.saveRefreshToken(payload.sub, newTokens.refreshToken);

    return newTokens;
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { success: true };
  }
}
