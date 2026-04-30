import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsNotEmpty,
  IsDateString,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateXarajatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom: string

  @IsString()
  @IsOptional()
  manzil?: string

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  miqdor: number

  @IsString()
  @IsNotEmpty()
  kategoriya: string

  @IsOptional()
  @IsDateString()
  sana?: string
}
