import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { UsersService } from '../users.service';
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaRepositories';
import { PrismaRoleRepository } from '../../../infrastructure/repositories/PrismaUserRepositories';
import { BadRequestError, NotFoundError } from '../../../core/errors/AppError';

vi.mock('bcrypt');
vi.mock('../../../infrastructure/repositories/PrismaRepositories', () => ({
  PrismaUserRepository: vi.fn().mockImplementation(() => ({
    findByEmailAndCompany: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findAllByCompany: vi.fn(),
    update: vi.fn(),
  })),
}));

vi.mock('../../../infrastructure/repositories/PrismaUserRepositories', () => ({
  PrismaRoleRepository: vi.fn().mockImplementation(() => ({
    findByNameAndCompany: vi.fn(),
    create: vi.fn(),
    findAllByCompany: vi.fn(),
    findById: vi.fn(),
  })),
}));

vi.mock('../../../core/database/prisma', () => ({
  prisma: {
    role: { create: vi.fn() },
    userRole: { create: vi.fn() },
  },
}));

describe('UsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should throw BadRequestError if user with email already exists in company', async () => {
      // Because we instantiated repos inside the file, we access the mocked instance
      const userRepoMock = new PrismaUserRepository();
      vi.mocked(userRepoMock.findByEmailAndCompany).mockResolvedValue({ id: '123' } as any);

      await expect(UsersService.createUser('company1', {
        email: 'test@example.com',
        name: 'Test',
        password: 'Password1!',
        roleIds: ['role1']
      })).rejects.toThrow(BadRequestError);
    });

    it('should successfully create a user and omit passwordHash from result', async () => {
      const userRepoMock = new PrismaUserRepository();
      vi.mocked(userRepoMock.findByEmailAndCompany).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pass' as any);
      vi.mocked(userRepoMock.create).mockResolvedValue({
        id: '123',
        companyId: 'company1',
        email: 'test@example.com',
        name: 'Test',
        passwordHash: 'hashed-pass',
        status: 'ACTIVE'
      } as any);

      const result = await UsersService.createUser('company1', {
        email: 'test@example.com',
        name: 'Test',
        password: 'Password1!',
        roleIds: ['role1']
      });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe('123');
    });
  });

  describe('assignRoleToUser', () => {
    it('should throw NotFoundError if user does not belong to company', async () => {
      const userRepoMock = new PrismaUserRepository();
      const roleRepoMock = new PrismaRoleRepository();
      
      vi.mocked(userRepoMock.findById).mockResolvedValue({ id: '123', companyId: 'other-company' } as any);
      vi.mocked(roleRepoMock.findById).mockResolvedValue({ id: 'role1', companyId: 'company1' } as any);

      await expect(UsersService.assignRoleToUser('123', 'role1', 'company1')).rejects.toThrow(NotFoundError);
    });
  });
});
