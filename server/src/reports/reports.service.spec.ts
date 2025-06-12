import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    expense: {
      findMany: jest.fn(),
    },
    income: {
      findMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMonthlyReport', () => {
    it('should return monthly report with totals and category breakdowns', async () => {
      const userId = '1';
      const year = 2024;
      const month = 3;

      const mockExpenses = [
        {
          id: 1,
          amount: 100,
          date: new Date('2024-03-01'),
          category: { id: 1, name: 'Food', type: 'EXPENSE' },
        },
        {
          id: 2,
          amount: 200,
          date: new Date('2024-03-02'),
          category: { id: 2, name: 'Transport', type: 'EXPENSE' },
        },
      ];

      const mockIncomes = [
        {
          id: 1,
          amount: 500,
          date: new Date('2024-03-01'),
          category: { id: 3, name: 'Salary', type: 'INCOME' },
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);
      mockPrismaService.income.findMany.mockResolvedValue(mockIncomes);

      const result = await service.getMonthlyReport(userId, year, month);

      const expectedDailyBalances = [
        { date: '2024-02-29', balance: 0 },
        { date: '2024-03-01', balance: 400 },
        { date: '2024-03-02', balance: 200 },
        ...Array.from({ length: 28 }, (_, i) => ({
          date: `2024-03-${String(i + 3).padStart(2, '0')}`,
          balance: 0,
        })),
      ];

      expect(result).toEqual({
        month,
        year,
        totalExpenses: 300,
        totalIncomes: 500,
        categoryTotals: {
          expenses: [
            { name: 'Food', total: 100 },
            { name: 'Transport', total: 200 },
          ],
          incomes: [
            { name: 'Salary', total: 500 },
          ],
        },
        dailyBalances: expectedDailyBalances,
      });
    });

    it('should handle empty results', async () => {
      const userId = '1';
      const year = 2024;
      const month = 3;

      mockPrismaService.expense.findMany.mockResolvedValue([]);
      mockPrismaService.income.findMany.mockResolvedValue([]);

      const result = await service.getMonthlyReport(userId, year, month);

      const expectedDailyBalances = [
        { date: '2024-02-29', balance: 0 },
        ...Array.from({ length: 30 }, (_, i) => ({
          date: `2024-03-${String(i + 1).padStart(2, '0')}`,
          balance: 0,
        })),
      ];

      expect(result).toEqual({
        month,
        year,
        totalExpenses: 0,
        totalIncomes: 0,
        categoryTotals: {
          expenses: [],
          incomes: [],
        },
        dailyBalances: expectedDailyBalances,
      });
    });
  });
}); 