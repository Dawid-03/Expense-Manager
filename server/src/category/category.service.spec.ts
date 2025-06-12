import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CategoryType } from '@prisma/client';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const userId = '1';
      const createDto = {
        name: 'Test Category',
        type: CategoryType.EXPENSE,
      };

      const mockCategory = {
        id: '1',
        ...createDto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(userId, createDto);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          userId,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all categories for a user', async () => {
      const userId = '1';
      const mockCategories = [
        {
          id: '1',
          name: 'Category 1',
          type: CategoryType.EXPENSE,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Category 2',
          type: CategoryType.INCOME,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockCategories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should filter categories by type', async () => {
      const userId = '1';
      const type = CategoryType.EXPENSE;
      const mockCategories = [
        {
          id: '1',
          name: 'Category 1',
          type: CategoryType.EXPENSE,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(userId, type);

      expect(result).toEqual(mockCategories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { userId, type },
      });
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const categoryId = '1';
      const userId = '1';
      const mockCategory = {
        id: categoryId,
        name: 'Test Category',
        type: CategoryType.EXPENSE,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      const result = await service.findOne(userId, categoryId);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: categoryId, userId },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      const categoryId = '1';
      const userId = '1';

      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const categoryId = '1';
      const userId = '1';
      const updateDto = {
        name: 'Updated Category',
        type: CategoryType.INCOME,
      };

      const mockCategory = {
        id: categoryId,
        name: 'Test Category',
        type: CategoryType.EXPENSE,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedCategory = {
        ...mockCategory,
        ...updateDto,
      };

      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue(mockUpdatedCategory);

      const result = await service.update(userId, categoryId, updateDto);

      expect(result).toEqual(mockUpdatedCategory);
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      const categoryId = '1';
      const userId = '1';
      const updateDto = {
        name: 'Updated Category',
      };

      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, categoryId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const categoryId = '1';
      const userId = '1';
      const mockCategory = {
        id: categoryId,
        name: 'Test Category',
        type: CategoryType.EXPENSE,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(userId, categoryId);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      const categoryId = '1';
      const userId = '1';

      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 