import {
  IsEmail,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class GetUserResDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiProperty({ description: 'The ID of a user', minimum: 1 })
  id?: number

  @IsString()
  @MinLength(4)
  @MaxLength(32)
  @ApiProperty({ description: 'The name of a user' })
  login: string

  @IsInt()
  @Min(18)
  @Max(100)
  @IsPositive()
  @ApiProperty({ description: 'The age of a user', minimum: 1 })
  age: number

  @IsString()
  @MinLength(12)
  @MaxLength(1024)
  @ApiProperty({ description: 'The description of a user profile' })
  description: string

  @IsEmail()
  @MaxLength(128)
  @ApiProperty({ description: 'The email of a user' })
  email: string

  @IsNumber()
  @MinLength(0)
  @ApiProperty({ description: 'The balance of a user' })
  balance?: number

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @ApiProperty({ description: 'The hashed password of a user profile' })
  password?: string

  @IsISO8601()
  @IsOptional()
  deletedAt?: string | null

  @IsISO8601()
  @IsOptional()
  createdAt?: string

  @IsISO8601()
  @IsOptional()
  updatedAt?: string
}
