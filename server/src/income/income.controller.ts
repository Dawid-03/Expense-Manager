import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseDatePipe, ParseFloatPipe } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Incomes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new income' })
  @ApiResponse({ status: 201, description: 'Income successfully created' })
  async create(
    @CurrentUser() user: User,
    @Body() createIncomeDto: CreateIncomeDto,
  ) {
    return this.incomeService.create(user.id, createIncomeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all incomes with optional filters' })
  @ApiResponse({ status: 200, description: 'Return all incomes' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'minAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number })
  async findAll(
    @CurrentUser() user: User,
    @Query('startDate', new ParseDatePipe({ optional: true })) startDate?: Date,
    @Query('endDate', new ParseDatePipe({ optional: true })) endDate?: Date,
    @Query('categoryId') categoryId?: string,
    @Query('minAmount', new ParseFloatPipe({ optional: true })) minAmount?: number,
    @Query('maxAmount', new ParseFloatPipe({ optional: true })) maxAmount?: number,
  ) {
    return this.incomeService.findAll(user.id, {
      startDate,
      endDate,
      categoryId,
      minAmount,
      maxAmount,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an income by id' })
  @ApiResponse({ status: 200, description: 'Return the income' })
  @ApiResponse({ status: 404, description: 'Income not found' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.incomeService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an income' })
  @ApiResponse({ status: 200, description: 'Income successfully updated' })
  @ApiResponse({ status: 404, description: 'Income not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    return this.incomeService.update(user.id, id, updateIncomeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an income' })
  @ApiResponse({ status: 200, description: 'Income successfully deleted' })
  @ApiResponse({ status: 404, description: 'Income not found' })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.incomeService.remove(user.id, id);
  }
} 