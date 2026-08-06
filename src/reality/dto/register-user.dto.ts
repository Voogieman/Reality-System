import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterUserDto {
  @ApiProperty({
    description: "Email пользователя",
    example: "vugar@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Отображаемое имя пользователя",
    example: "Vugar Guliev",
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({
    description: "Пароль пользователя",
    example: "StrongPassword123!",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
