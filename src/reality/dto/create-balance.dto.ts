import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateBalanceDto {
    @ApiProperty({
        description: 'Локация для создания баланса',
        example: 'Стрелка Волги и Оки'
    })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({
        description: 'Начальная энергия Света (0-100)',
        example: 50
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    lightEnergy: number;

    @ApiProperty({
        description: 'Начальная энергия Тьмы (0-100)',
        example: 50
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    darknessEnergy: number;

    @ApiProperty({
        description: 'ID создателя',
        example: 'vugar_guliev_1996'
    })
    @IsString()
    @IsNotEmpty()
    creatorId: string;
}