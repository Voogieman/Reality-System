import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { SLAVIC_GOD_IDS } from '../../gods/slavic-gods.constants';

export class PerformRitualDto {
    @ApiProperty({
        description: 'Бог пантеона, которому адресован ритуал',
        enum: SLAVIC_GOD_IDS,
        example: 'veles',
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(SLAVIC_GOD_IDS)
    godName: string;

    @ApiProperty({
        description: 'Тип ритуала',
        enum: ['purification', 'blessing', 'consecration', 'weaving', 'coition', 'offer'],
        example: 'purification',
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(['purification', 'blessing', 'consecration', 'weaving', 'coition', 'offer'])
    ritualType: string;

    @ApiProperty({
        description: 'Принимающая сторона',
        example: 'человек(имя фамилия)',
    })
    @IsString()
    @IsNotEmpty()
    person: string;

    @ApiProperty({
        description: 'Локация проведения ритуала',
        example: 'Нижегородский кремль',
    })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({
        description: 'Интенсивность ритуала (1-100)',
        example: 75,
    })
    @IsNumber()
    @Min(1)
    @Max(100)
    intensity: number;

    @ApiProperty({
        description: 'ID проводящего ритуал (не нужен при JWT — берётся из токена)',
        example: 'vugar_guliev_1996',
        required: false,
    })
    @IsOptional()
    @IsString()
    invokerId?: string;
}