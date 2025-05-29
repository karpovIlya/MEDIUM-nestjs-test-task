import { IsString, MinLength, MaxLength, IsEmail } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SignInDto {
  @IsEmail()
  @MaxLength(128)
  @ApiProperty({ description: 'The email of a exist user' })
  email: string

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @ApiProperty({ description: 'The password of a exist user profile' })
  password: string
}
