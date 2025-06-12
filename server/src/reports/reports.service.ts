import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlyReport(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const incomes = await this.prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const categoryTotals = {
      expenses: new Map<string, { name: string; total: number }>(),
      incomes: new Map<string, { name: string; total: number }>(),
    };

    expenses.forEach((expense) => {
      const category = expense.category;
      const current = categoryTotals.expenses.get(category.id) || {
        name: category.name,
        total: 0,
      };
      current.total += expense.amount;
      categoryTotals.expenses.set(category.id, current);
    });

    incomes.forEach((income) => {
      const category = income.category;
      const current = categoryTotals.incomes.get(category.id) || {
        name: category.name,
        total: 0,
      };
      current.total += income.amount;
      categoryTotals.incomes.set(category.id, current);
    });

    const dailyBalances = new Map<string, number>();
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      dailyBalances.set(date.toISOString().split('T')[0], 0);
    }

    const allTransactions = [
      ...expenses.map((e) => ({ ...e, type: 'expense' as const })),
      ...incomes.map((i) => ({ ...i, type: 'income' as const })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    let runningBalance = 0;
    allTransactions.forEach((transaction) => {
      const date = transaction.date.toISOString().split('T')[0];
      if (transaction.type === 'expense') {
        runningBalance -= transaction.amount;
      } else {
        runningBalance += transaction.amount;
      }
      dailyBalances.set(date, runningBalance);
    });

    return {
      month,
      year,
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      totalIncomes: incomes.reduce((sum, i) => sum + i.amount, 0),
      categoryTotals: {
        expenses: Array.from(categoryTotals.expenses.values()),
        incomes: Array.from(categoryTotals.incomes.values()),
      },
      dailyBalances: Array.from(dailyBalances.entries()).map(([date, balance]) => ({
        date,
        balance,
      })),
    };
  }

  async getCategoryReport(userId: string, type: CategoryType) {
    const categories = await this.prisma.category.findMany({
      where: {
        userId,
        type,
      },
    });

    const report = await Promise.all(
      categories.map(async (category) => {
        const transactions =
          type === 'EXPENSE'
            ? await this.prisma.expense.findMany({
                where: {
                  userId,
                  categoryId: category.id,
                },
                orderBy: {
                  date: 'desc',
                },
              })
            : await this.prisma.income.findMany({
                where: {
                  userId,
                  categoryId: category.id,
                },
                orderBy: {
                  date: 'desc',
                },
              });

        return {
          category,
          total: transactions.reduce((sum, t) => sum + t.amount, 0),
          transactions,
        };
      }),
    );

    return report;
  }
} 