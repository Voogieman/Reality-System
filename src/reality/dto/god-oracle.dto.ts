import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { SLAVIC_GOD_IDS } from '../../gods/slavic-gods.constants';

class OracleOfferingDto {
    @ApiProperty({ example: 'мёд' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiPropertyOptional({ example: 85 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    purity?: number;

    @ApiPropertyOptional({ example: 90 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    significance?: number;
}

export class GodOracleDto {
    @ApiProperty({ enum: SLAVIC_GOD_IDS, example: 'veles' })
    @IsString()
    @IsNotEmpty()
    @IsIn(SLAVIC_GOD_IDS)
    godName: string;

    @ApiProperty({ example: 'получение мудрости предков' })
    @IsString()
    @IsNotEmpty()
    intention: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ type: OracleOfferingDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => OracleOfferingDto)
    offering?: OracleOfferingDto;
}
