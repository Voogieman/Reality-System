import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsObject } from 'class-validator';

class OfferingDto {
    @ApiProperty({
        description: 'Тип подношения',
        example: 'медовуха'
    })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({
        description: 'Чистота подношения (0-100)',
        example: 85
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    purity: number;

    @ApiProperty({
        description: 'Значимость подношения (0-100)',
        example: 90
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    significance: number;
}

export class ContactGodDto {
    @ApiProperty({
        description: 'ID пользователя',
        example: 'vugar_guliev_1996'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Имя бога для контакта',
        enum: ['belobog', 'chernobog', 'perun', 'mokosh', 'veles', 'svarog', 'vyshen'],
        example: 'perun'
    })
    @IsString()
    @IsNotEmpty()
    godName: string;

    @ApiProperty({
        description: 'Подношение богу',
        type: OfferingDto
    })
    @IsObject()
    @IsNotEmpty()
    offering: OfferingDto;

    @ApiProperty({
        description: 'Намерение контакта',
        example: 'получение силы для защиты'
    })
    @IsString()
    @IsNotEmpty()
    intention: string;
}