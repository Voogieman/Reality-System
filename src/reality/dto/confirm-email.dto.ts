import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailDto {
    @ApiProperty({
        description: 'Токен подтверждения email',
        example: '7de5f6d4c5b6a1234ef....',
    })
    @IsString()
    @IsNotEmpty()
    token: string;
}
