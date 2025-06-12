import { Test, TestingModule } from '@nestjs/testing';
import { IncomeService } from './income.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CategoryService } from '../category/category.service';

describe('IncomeService', () => {
  let service: IncomeService;
  let prisma: PrismaService;
  let categoryService: CategoryService;

  const mockPrismaService = {
    income: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCategoryService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncomeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    service = module.get<IncomeService>(IncomeService);
    prisma = module.get<PrismaService>(PrismaService);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an income', async () => {
      const userId = '1';
      const createDto = {
        description: 'Test Income',
        amount: 100,
        date: new Date(),
        categoryId: '1',
      };

      const mockCategory = {
        id: '1',
        name: 'Test Category',
        type: 'INCOME',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockIncome = {
        id: '1',
        ...createDto,
        userId,
        category: mockCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryService.findOne.mockResolvedValue(mockCategory);
      mockPrismaService.income.create.mockResolvedValue(mockIncome);

      const result = await service.create(userId, createDto);

      expect(result).toEqual(mockIncome);
      expect(mockCategoryService.findOne).toHaveBeenCalledWith(userId, createDto.categoryId);
      expect(mockPrismaService.income.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          userId,
        },
        include: {
          category: true,
        },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      const userId = '1';
      const createDto = {
        description: 'Test Income',
        amount: 100,
        date: new Date(),
        categoryId: '1',
      };

      mockCategoryService.findOne.mockRejectedValue(new NotFoundException('Category not found'));

      await expect(service.create(userId, createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all incomes for a user', async () => {
      const userId = '1';
      const mockIncomes = [
        {
          id: '1',
          description: 'Income 1',
          amount: 100,
          date: new Date(),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'INCOME',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.income.findMany.mockResolvedValue(mockIncomes);

      const result = await service.findAll(userId, {});

      expect(result).toEqual(mockIncomes);
      expect(mockPrismaService.income.findMany).toHaveBeenCalledWith({
        where: {
          userId,
        },
        include: {
          category: true,
        },
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should filter incomes by date range', async () => {
      const userId = '1';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockIncomes = [
        {
          id: '1',
          description: 'Income 1',
          amount: 100,
          date: new Date('2024-01-15'),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'INCOME',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.income.findMany.mockResolvedValue(mockIncomes);

      const result = await service.findAll(userId, { startDate, endDate });

      expect(result).toEqual(mockIncomes);
      expect(mockPrismaService.income.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'desc',
        },
        include: {
          category: true,
        },
      });
    });

    it('should filter incomes by category', async () => {
      const userId = '1';
      const categoryId = '1';
      const mockIncomes = [
        {
          id: '1',
          description: 'Income 1',
          amount: 100,
          date: new Date(),
          categoryId,
          userId,
          category: {
            id: categoryId,
            name: 'Category 1',
            type: 'INCOME',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.income.findMany.mockResolvedValue(mockIncomes);

      const result = await service.findAll(userId, { categoryId });

      expect(result).toEqual(mockIncomes);
      expect(mockPrismaService.income.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          categoryId,
        },
        include: {
          category: true,
        },
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should filter incomes by amount range', async () => {
      const userId = '1';
      const minAmount = 100;
      const maxAmount = 200;
      const mockIncomes = [
        {
          id: '1',
          description: 'Income 1',
          amount: 150,
          date: new Date(),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'INCOME',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.income.findMany.mockResolvedValue(mockIncomes);

      const result = await service.findAll(userId, { minAmount, maxAmount });

      expect(result).toEqual(mockIncomes);
      expect(mockPrismaService.income.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          amount: {
            gte: minAmount,
            lte: maxAmount,
          },
        },
        orderBy: {
          date: 'desc',
        },
        include: {
          category: true,
        },
      });
    });

    it('should filter incomes by single date', async () => {
      const userId = '1';
      const startDate = new Date('2024-01-01');
      const mockIncomes = [
        {
          id: '1',
          description: 'Income 1',
          amount: 100,
          date: new Date('2024-01-15'),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'INCOME',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.income.findMany.mockResolvedValue(mockIncomes);

      const result = await service.findAll(userId, { startDate });

      expect(result).toEqual(mockIncomes);
      expect(mockPrismaService.income.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: startDate,
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should filter incomes by single amount', async () => {
      const userId = '1';
      const minAmount = 100;
      const mockIncomes = [
        {
          id: '1',
          description: 'Income 1',
          amount: 150,
          date: new Date(),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'INCOME',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.income.findMany.mockResolvedValue(mockIncomes);

      const result = await service.findAll(userId, { minAmount });

      expect(result).toEqual(mockIncomes);
      expect(mockPrismaService.income.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          amount: {
            gte: minAmount,
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          date: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return an income by id', async () => {
      const userId = '1';
      const incomeId = '1';
      const mockIncome = {
        id: incomeId,
        description: 'Test Income',
        amount: 100,
        date: new Date(),
        categoryId: '1',
        userId,
        category: {
          id: '1',
          name: 'Category 1',
          type: 'INCOME',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.income.findUnique.mockResolvedValue(mockIncome);

      const result = await service.findOne(userId, incomeId);

      expect(result).toEqual(mockIncome);
      expect(mockPrismaService.income.findUnique).toHaveBeenCalledWith({
        where: {
          id: incomeId,
        },
        include: {
          category: true,
        },
      });
    });

    it('should throw NotFoundException if income not found', async () => {
      const userId = '1';
      const incomeId = '1';

      mockPrismaService.income.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, incomeId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an income', async () => {
      const userId = '1';
      const incomeId = '1';
      const updateDto = {
        description: 'Updated Income',
        amount: 200,
      };

      const mockIncome = {
        id: incomeId,
        ...updateDto,
        date: new Date(),
        categoryId: '1',
        userId,
        category: {
          id: '1',
          name: 'Category 1',
          type: 'INCOME',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.income.findUnique.mockResolvedValue(mockIncome);
      mockPrismaService.income.update.mockResolvedValue(mockIncome);

      const result = await service.update(userId, incomeId, updateDto);

      expect(result).toEqual(mockIncome);
      expect(mockPrismaService.income.update).toHaveBeenCalledWith({
        where: { id: incomeId },
        data: updateDto,
        include: {
          category: true,
        },
      });
    });

    it('should throw NotFoundException if income not found', async () => {
      const userId = '1';
      const incomeId = '1';
      const updateDto = {
        description: 'Updated Income',
      };

      mockPrismaService.income.findUnique.mockResolvedValue(null);

      await expect(service.update(userId, incomeId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an income', async () => {
      const userId = '1';
      const incomeId = '1';
      const mockIncome = {
        id: incomeId,
        description: 'Test Income',
        amount: 100,
        date: new Date(),
        categoryId: '1',
        userId,
        category: {
          id: '1',
          name: 'Category 1',
          type: 'INCOME',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.income.findUnique.mockResolvedValue(mockIncome);
      mockPrismaService.income.delete.mockResolvedValue(mockIncome);

      const result = await service.remove(userId, incomeId);

      expect(result).toEqual(mockIncome);
      expect(mockPrismaService.income.delete).toHaveBeenCalledWith({
        where: { id: incomeId },
      });
    });

    it('should throw NotFoundException if income not found', async () => {
      const userId = '1';
      const incomeId = '1';

      mockPrismaService.income.findUnique.mockResolvedValue(null);

      await expect(service.remove(userId, incomeId)).rejects.toThrow(NotFoundException);
    });
  });
}); 