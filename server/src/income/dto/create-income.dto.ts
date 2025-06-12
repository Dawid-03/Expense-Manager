import { IsString, IsNumber, IsDate, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateIncomeDto {
  @ApiProperty({ example: 'Salary' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 3000.00 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2024-03-20' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
} 