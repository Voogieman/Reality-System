import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export const ORACLE_EMOTIONS = [
  "lighter",
  "held",
  "still-heavy",
  "need-more",
] as const;

export class OracleFeedbackDto {
  @ApiProperty({ example: "oracle_123" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  messageId: string;

  @ApiProperty({ enum: ORACLE_EMOTIONS })
  @IsString()
  @IsIn(ORACLE_EMOTIONS)
  emotion: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(400)
  note?: string;
}
