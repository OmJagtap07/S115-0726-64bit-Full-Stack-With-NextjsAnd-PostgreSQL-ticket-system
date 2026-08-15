import bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './users.dto';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaRepositories';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../core/errors/AppError';

const userRepo = new PrismaUserRepository();

export class UsersService {
  static async createUser(data: CreateUserDto) {
    const existingUser = await userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await userRepo.create({
      email: data.email,
      name: data.name,
      passwordHash: hashedPassword,
      role: data.role,
      isActive: true,
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getUsers(filters?: any, include?: any) {
    const users = await userRepo.findAll(filters, include);
    return users.map(({ passwordHash, ...u }) => u);
  }

  static async getUserById(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateUser(userId: string, data: UpdateUserDto) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await userRepo.update(userId, data);
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  static async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Incorrect current password');
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 12);
    
    // We need to update the passwordHash. Our repository's update method uses UpdateUserDto which might not include passwordHash.
    // Wait, let me check PrismaUserRepository. It accepts Partial<User>. So we can pass passwordHash.
    const updatedUser = await userRepo.update(userId, { passwordHash: newPasswordHash } as any);
    
    return { success: true };
  }
}
