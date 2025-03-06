import {
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  IsPositive,
  IsEmail,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  @ApiProperty({ description: 'The name of a user' })
  login: string

  @IsInt()
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

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @ApiProperty({ description: 'The password of a user profile' })
  password: string
}
