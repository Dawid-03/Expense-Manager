import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseDatePipe, ParseFloatPipe } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'Expense successfully created' })
  async create(
    @CurrentUser() user: User,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expenseService.create(user.id, createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with optional filters' })
  @ApiResponse({ status: 200, description: 'Return all expenses' })
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
    return this.expenseService.findAll(user.id, {
      startDate,
      endDate,
      categoryId,
      minAmount,
      maxAmount,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by id' })
  @ApiResponse({ status: 200, description: 'Return the expense' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.expenseService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, description: 'Expense successfully updated' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(user.id, id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 200, description: 'Expense successfully deleted' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.expenseService.remove(user.id, id);
  }
} 