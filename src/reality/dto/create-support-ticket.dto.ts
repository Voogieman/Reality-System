import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateSupportTicketDto {
  @ApiProperty({ example: "Не приходит ответ оракула" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: "Описал проблему: ..." })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(4000)
  message: string;

  @ApiPropertyOptional({ example: "user@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "Воин Руси" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;
}
