import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class MatchGodDto {
  @ApiProperty({ example: "stuck" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  situation: string;

  @ApiPropertyOptional({ example: "Не вижу, куда идти" })
  @IsOptional()
  @IsString()
  @MaxLength(800)
  need?: string;

  @ApiPropertyOptional({ example: "images" })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  tone?: string;
}
