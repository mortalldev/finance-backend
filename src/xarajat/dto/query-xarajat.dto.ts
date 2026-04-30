import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryXarajatDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10

  @IsOptional()
  @IsString()
  kategoriya?: string

  @IsOptional()
  @IsDateString()
  fromDate?: string

  @IsOptional()
  @IsDateString()
  toDate?: string
}
