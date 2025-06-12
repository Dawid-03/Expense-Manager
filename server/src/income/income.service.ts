import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from '../category/category.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { QueryIncomeDto } from './dto/query-income.dto';

@Injectable()
export class IncomeService {
  constructor(
    private prisma: PrismaService,
    private categoryService: CategoryService,
  ) {}

  async create(userId: string, createIncomeDto: CreateIncomeDto) {
    await this.categoryService.findOne(userId, createIncomeDto.categoryId);

    return this.prisma.income.create({
      data: {
        ...createIncomeDto,
        userId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(userId: string, query: QueryIncomeDto) {
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

    return this.prisma.income.findMany({
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
    const income = await this.prisma.income.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!income || income.userId !== userId) {
      throw new NotFoundException('Income not found');
    }

    return income;
  }

  async update(userId: string, id: string, updateIncomeDto: UpdateIncomeDto) {
    await this.findOne(userId, id);

    if (updateIncomeDto.categoryId) {
      await this.categoryService.findOne(userId, updateIncomeDto.categoryId);
    }

    return this.prisma.income.update({
      where: { id },
      data: updateIncomeDto,
      include: {
        category: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.income.delete({
      where: { id },
    });
  }
} 