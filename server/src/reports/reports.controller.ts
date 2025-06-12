import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly-totals')
  @ApiOperation({ summary: 'Get monthly totals for expenses and incomes' })
  @ApiResponse({
    status: 200,
    description: 'Returns total expenses, incomes, and balance for the specified month',
  })
  async getMonthlyTotals(
    @Request() req,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.getMonthlyReport(req.user.id, year, month);
  }

  @Get('expenses-by-category')
  @ApiOperation({ summary: 'Get expenses grouped by category' })
  @ApiResponse({
    status: 200,
    description: 'Returns expenses grouped by category for the specified month',
  })
  async getExpensesByCategory(
    @Request() req,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.getMonthlyReport(req.user.id, year, month);
  }

  @Get('balance-overview')
  @ApiOperation({ summary: 'Get detailed balance overview' })
  @ApiResponse({
    status: 200,
    description: 'Returns detailed balance overview including daily balance history',
  })
  async getBalanceOverview(
    @Request() req,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.getMonthlyReport(req.user.id, year, month);
  }
} 