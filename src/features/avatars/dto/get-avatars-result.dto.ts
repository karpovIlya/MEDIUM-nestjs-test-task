import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class AvatarDto {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'The ID of a avatar', minimum: 1 })
  id?: number

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'The ID of a user', minimum: 1 })
  userId: number

  @IsString()
  @ApiProperty({ description: 'The path of a avatar' })
  path: string

  @IsISO8601()
  @IsOptional()
  createdAt?: string

  @IsISO8601()
  @IsOptional()
  updatedAt?: string

  @IsISO8601()
  @IsOptional()
  deletedAt?: string
}

export class GetAvatarsResultDto {
  @IsArray()
  @Type(() => AvatarDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [AvatarDto] })
  avatars: AvatarDto[]
}
