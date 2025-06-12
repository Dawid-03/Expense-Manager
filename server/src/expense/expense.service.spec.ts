import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CategoryService } from '../category/category.service';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let prisma: PrismaService;
  let categoryService: CategoryService;

  const mockPrismaService = {
    expense: {
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
        ExpenseService,
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

    service = module.get<ExpenseService>(ExpenseService);
    prisma = module.get<PrismaService>(PrismaService);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an expense', async () => {
      const userId = '1';
      const createDto = {
        description: 'Test Expense',
        amount: 100,
        date: new Date(),
        categoryId: '1',
      };

      const mockCategory = {
        id: '1',
        name: 'Test Category',
        type: 'EXPENSE',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockExpense = {
        id: '1',
        ...createDto,
        userId,
        category: mockCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryService.findOne.mockResolvedValue(mockCategory);
      mockPrismaService.expense.create.mockResolvedValue(mockExpense);

      const result = await service.create(userId, createDto);

      expect(result).toEqual(mockExpense);
      expect(mockCategoryService.findOne).toHaveBeenCalledWith(userId, createDto.categoryId);
      expect(mockPrismaService.expense.create).toHaveBeenCalledWith({
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
        description: 'Test Expense',
        amount: 100,
        date: new Date(),
        categoryId: '1',
      };

      mockCategoryService.findOne.mockRejectedValue(new NotFoundException('Category not found'));

      await expect(service.create(userId, createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all expenses for a user', async () => {
      const userId = '1';
      const mockExpenses = [
        {
          id: '1',
          description: 'Expense 1',
          amount: 100,
          date: new Date(),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'EXPENSE',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.findAll(userId, {});

      expect(result).toEqual(mockExpenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
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

    it('should filter expenses by date range', async () => {
      const userId = '1';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockExpenses = [
        {
          id: '1',
          description: 'Expense 1',
          amount: 100,
          date: new Date('2024-01-15'),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'EXPENSE',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.findAll(userId, { startDate, endDate });

      expect(result).toEqual(mockExpenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
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

    it('should filter expenses by category', async () => {
      const userId = '1';
      const categoryId = '1';
      const mockExpenses = [
        {
          id: '1',
          description: 'Expense 1',
          amount: 100,
          date: new Date(),
          categoryId,
          userId,
          category: {
            id: categoryId,
            name: 'Category 1',
            type: 'EXPENSE',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.findAll(userId, { categoryId });

      expect(result).toEqual(mockExpenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
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

    it('should filter expenses by amount range', async () => {
      const userId = '1';
      const minAmount = 100;
      const maxAmount = 200;
      const mockExpenses = [
        {
          id: '1',
          description: 'Expense 1',
          amount: 150,
          date: new Date(),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'EXPENSE',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.findAll(userId, { minAmount, maxAmount });

      expect(result).toEqual(mockExpenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          amount: {
            gte: 100,
            lte: 200,
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

    it('should filter expenses by single date', async () => {
      const userId = '1';
      const startDate = new Date('2024-01-01');
      const mockExpenses = [
        {
          id: '1',
          description: 'Expense 1',
          amount: 100,
          date: new Date('2024-01-15'),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'EXPENSE',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.findAll(userId, { startDate });

      expect(result).toEqual(mockExpenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: new Date('2024-01-01'),
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

    it('should filter expenses by single amount', async () => {
      const userId = '1';
      const minAmount = 100;
      const mockExpenses = [
        {
          id: '1',
          description: 'Expense 1',
          amount: 150,
          date: new Date(),
          categoryId: '1',
          userId,
          category: {
            id: '1',
            name: 'Category 1',
            type: 'EXPENSE',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.findAll(userId, { minAmount });

      expect(result).toEqual(mockExpenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          amount: {
            gte: 100,
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
  });

  describe('findOne', () => {
    it('should return an expense by id', async () => {
      const userId = '1';
      const expenseId = '1';
      const mockExpense = {
        id: expenseId,
        description: 'Test Expense',
        amount: 100,
        date: new Date(),
        categoryId: '1',
        userId,
        category: {
          id: '1',
          name: 'Category 1',
          type: 'EXPENSE',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);

      const result = await service.findOne(userId, expenseId);

      expect(result).toEqual(mockExpense);
      expect(mockPrismaService.expense.findUnique).toHaveBeenCalledWith({
        where: {
          id: expenseId,
        },
        include: {
          category: true,
        },
      });
    });

    it('should throw NotFoundException if expense not found', async () => {
      const userId = '1';
      const expenseId = '1';

      mockPrismaService.expense.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, expenseId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an expense', async () => {
      const userId = '1';
      const expenseId = '1';
      const updateDto = {
        description: 'Updated Expense',
        amount: 200,
      };

      const mockExpense = {
        id: expenseId,
        ...updateDto,
        date: new Date(),
        categoryId: '1',
        userId,
        category: {
          id: '1',
          name: 'Category 1',
          type: 'EXPENSE',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);
      mockPrismaService.expense.update.mockResolvedValue(mockExpense);

      const result = await service.update(userId, expenseId, updateDto);

      expect(result).toEqual(mockExpense);
      expect(mockPrismaService.expense.update).toHaveBeenCalledWith({
        where: { id: expenseId },
        data: updateDto,
        include: {
          category: true,
        },
      });
    });

    it('should throw NotFoundException if expense not found', async () => {
      const userId = '1';
      const expenseId = '1';
      const updateDto = {
        description: 'Updated Expense',
      };

      mockPrismaService.expense.findUnique.mockResolvedValue(null);

      await expect(service.update(userId, expenseId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an expense', async () => {
      const userId = '1';
      const expenseId = '1';
      const mockExpense = {
        id: expenseId,
        description: 'Test Expense',
        amount: 100,
        date: new Date(),
        categoryId: '1',
        userId,
        category: {
          id: '1',
          name: 'Category 1',
          type: 'EXPENSE',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);
      mockPrismaService.expense.delete.mockResolvedValue(mockExpense);

      const result = await service.remove(userId, expenseId);

      expect(result).toEqual(mockExpense);
      expect(mockPrismaService.expense.delete).toHaveBeenCalledWith({
        where: { id: expenseId },
      });
    });

    it('should throw NotFoundException if expense not found', async () => {
      const userId = '1';
      const expenseId = '1';

      mockPrismaService.expense.findUnique.mockResolvedValue(null);

      await expect(service.remove(userId, expenseId)).rejects.toThrow(NotFoundException);
    });
  });
}); 