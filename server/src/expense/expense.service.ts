import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from '../category/category.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private categoryService: CategoryService,
  ) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto) {
    await this.categoryService.findOne(userId, createExpenseDto.categoryId);

    return this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        userId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(userId: string, query: QueryExpenseDto) {
    const where: any = { userId };

    if (query.startDate && query.endDate) {
      where.date = {
        gte: query.startDate,
        lte: query.endDate,
      };
    } else if (query.startDate) {
      where.date = {
        gte: query.startDate,
      };
    } else if (query.endDate) {
      where.date = {
        lte: query.endDate,
      };
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.minAmount && query.maxAmount) {
      where.amount = {
        gte: query.minAmount,
        lte: query.maxAmount,
      };
    } else if (query.minAmount) {
      where.amount = {
        gte: query.minAmount,
      };
    } else if (query.maxAmount) {
      where.amount = {
        lte: query.maxAmount,
      };
    }

    return this.prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!expense || expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(userId: string, id: string, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(userId, id);

    if (updateExpenseDto.categoryId) {
      await this.categoryService.findOne(userId, updateExpenseDto.categoryId);
    }

    return this.prisma.expense.update({
      where: { id },
      data: updateExpenseDto,
      include: {
        category: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.expense.delete({
      where: { id },
    });
  }
} 