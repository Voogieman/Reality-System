import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsArray } from 'class-validator';

export class PerformRitualDto {
    @ApiProperty({
        description: 'Тип ритуала',
        enum: ['purification', 'blessing', 'consecration', 'shadow_weaving', 'chaos_embrace', 'coition', 'offerJob '],
        example: 'purification'
    })
    @IsString()
    @IsNotEmpty()
    ritualType: string;

    @ApiProperty({
        description: 'принимаемая сторона',
        example: 'человек(имя фамилия)'
    })
    @IsString()
    @IsNotEmpty()
    person: string


    @ApiProperty({
        description: 'Локация проведения ритуала',
        example: 'Нижегородский кремль'
    })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({
        description: 'Интенсивность ритуала (1-100)',
        example: 75
    })
    @IsNumber()
    @Min(1)
    @Max(100)
    intensity: number;

    @ApiProperty({
        description: 'ID проводящего ритуал',
        example: 'vugar_guliev_1996'
    })
    @IsString()
    @IsNotEmpty()
    invokerId: string;
}