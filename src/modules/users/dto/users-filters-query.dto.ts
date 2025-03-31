import { IsString, MaxLength, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UsersFiltersQueryDto {
  @IsString()
  @IsOptional()
  @MaxLength(32)
  @ApiProperty({ description: 'Filter users by login', required: false })
  login?: string
}
