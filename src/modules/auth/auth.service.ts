import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config';
import { BadRequestError, UnauthorizedError } from '../../core/errors/AppError';
import { RegisterAdminDto, LoginDto, RefreshTokenDto } from './auth.dto';
import { logger } from '../../core/logger/winston';
import { PrismaUserRepository, PrismaSessionRepository } from '../../infrastructure/repositories/PrismaRepositories';
import { Role } from '@prisma/client';

const userRepo = new PrismaUserRepository();
const sessionRepo = new PrismaSessionRepository();

export class AuthService {
  static async registerAdmin(data: RegisterAdminDto) {
    const { name, email, password } = data;

    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userRepo.create({
      email,
      name,
      passwordHash: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    });

    return { user };
  }

  static async login(data: LoginDto) {
    const { email, password } = data;

    const user = await userRepo.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials or account disabled');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  static async refreshToken(data: RefreshTokenDto) {
    const { refreshToken } = data;
    const tokenHash = this.hashToken(refreshToken);

    const session = await sessionRepo.findByRefreshTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (!session.isValid || session.expiresAt < new Date()) {
      logger.warn(`Security Alert: Refresh token reuse detected for user ${session.userId}. Revoking all sessions.`);
      await sessionRepo.invalidateAllUserSessions(session.userId);
      throw new UnauthorizedError('Token reuse detected. All sessions revoked. Please log in again.');
    }

    await sessionRepo.invalidateSession(session.id);

    const user = await userRepo.findById(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or disabled');
    }

    return this.generateTokens(session.userId);
  }

  static async logout(data: RefreshTokenDto) {
    const tokenHash = this.hashToken(data.refreshToken);
    const session = await sessionRepo.findByRefreshTokenHash(tokenHash);
    if (session) {
      await sessionRepo.invalidateSession(session.id);
    }
  }

  private static async generateTokens(userId: string) {
    const plainRefreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = this.hashToken(plainRefreshToken);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await sessionRepo.createSession({
      userId,
      refreshTokenHash,
      expiresAt,
    });

    const accessToken = jwt.sign(
      { 
        userId, 
        sessionId: session.id,
      }, 
      config.JWT_SECRET, 
      { expiresIn: config.JWT_EXPIRES_IN as any }
    );

    return { accessToken, refreshToken: plainRefreshToken };
  }

  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
