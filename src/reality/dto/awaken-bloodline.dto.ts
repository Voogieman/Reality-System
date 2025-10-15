import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class AwakenBloodlineDto {
    @ApiProperty({
        description: 'ID пользователя',
        example: 'vugar_guliev_1996'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Локация пробуждения',
        example: 'Квартира на Московском шоссе, Нижний Новгород'
    })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({
        description: 'Фамильная реликвия для аутентификации',
        example: 'Медный браслет предков'
    })
    @IsString()
    @IsNotEmpty()
    heirloom: string;

    @ApiProperty({
        description: 'Родовая память (опционально)',
        required: false,
        example: { ancestors: ['хранители', 'волхвы'], memoryFragments: ['знание рун', 'управление энергией'] }
    })
    @IsObject()
    @IsOptional()
    ancestralMemory?: any;
}