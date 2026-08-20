import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class TelegramAuthDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  auth_date: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hash: string;
}
