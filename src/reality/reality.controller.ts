import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { RealityService } from "./reality.service";
import { PerformRitualDto } from "./dto/perform-ritual.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
import { ConfirmEmailDto } from "./dto/confirm-email.dto";
import { GodOracleDto } from "./dto/god-oracle.dto";
import { LoginDto } from "./dto/login.dto";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthUser } from "../auth/jwt-payload.interface";

@ApiTags("reality")
@Controller("reality")
export class RealityController {
  constructor(private readonly realityService: RealityService) {}

  @Post("auth/register")
  @ApiTags("auth")
  @ApiOperation({
    summary: "Регистрация пользователя",
    description:
      "Создаёт пользователя в БД и возвращает ссылку подтверждения email",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Пользователь зарегистрирован",
  })
  @ApiBody({ type: RegisterUserDto })
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.realityService.registerUser(registerUserDto);
  }

  @Get("auth/confirm-email")
  @ApiTags("auth")
  @ApiOperation({
    summary: "Подтверждение email",
    description: "Подтверждает email пользователя по токену из письма",
  })
  @ApiQuery({ name: "token", required: true })
  @ApiResponse({ status: HttpStatus.OK, description: "Email подтвержден" })
  async confirmEmail(@Query("token") token: string) {
    const dto: ConfirmEmailDto = { token };
    return this.realityService.confirmEmail(dto);
  }

  @Post("auth/login")
  @ApiTags("auth")
  @ApiOperation({
    summary: "Вход (JWT)",
    description: "Проверяет email/пароль и возвращает Bearer JWT accessToken",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: "JWT выдан" })
  async login(@Body() loginDto: LoginDto) {
    return this.realityService.login(loginDto);
  }

  @Post("auth/logout")
  @ApiTags("auth")
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Выход",
    description: "Инвалидирует текущую JWT-сессию",
  })
  async logout(@CurrentUser() user: AuthUser) {
    return this.realityService.logout(user);
  }

  @Get("auth/me")
  @ApiTags("auth")
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Текущий пользователь",
    description: "Возвращает профиль по JWT Bearer-токену",
  })
  async getCurrentUser(@CurrentUser() user: AuthUser) {
    return this.realityService.getCurrentUser(user);
  }

  @Get("gods")
  @ApiTags("gods")
  @ApiOperation({
    summary: "Список славянских богов",
    description: "Полный пантеон для UI и выбора оракула",
  })
  listGods() {
    return this.realityService.listGods();
  }

  @Post("gods/oracle")
  @ApiTags("gods")
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Пророчество бога (ИИ)",
    description:
      "Ответ выбранного божества через LLM. Требуется JWT, userId берётся из токена.",
  })
  @ApiBody({ type: GodOracleDto })
  async askOracle(@Body() dto: GodOracleDto, @CurrentUser() user: AuthUser) {
    return this.realityService.askOracle(dto, user);
  }

  @Get("oracle/history")
  @ApiTags("gods")
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "История сообщений оракула",
    description: "История пророчеств текущего авторизованного пользователя",
  })
  async getOracleHistory(@CurrentUser() user: AuthUser) {
    return this.realityService.getOracleHistory(user.userId);
  }

  @Get("rituals/types")
  @ApiTags("rituals")
  @ApiOperation({
    summary: "Типы ритуалов",
    description: "Список доступных типов ритуалов из базы данных",
  })
  async getRitualTypes() {
    return this.realityService.getRitualTypes();
  }

  @Post("rituals/perform")
  @ApiTags("rituals")
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Выполнение ритуала",
    description:
      "Проведение магического ритуала с сохранением в историю. Требуется JWT, invokerId берётся из токена.",
  })
  @ApiBody({ type: PerformRitualDto })
  async performRitual(
    @Body() ritualDto: PerformRitualDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.realityService.performRitual(ritualDto, user);
  }

  @Get("rituals/history")
  @ApiTags("rituals")
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "История ритуалов",
    description:
      "История выполненных ритуалов текущего авторизованного пользователя",
  })
  async getRitualHistory(@CurrentUser() user: AuthUser) {
    return this.realityService.getRitualHistory(user.userId);
  }

  @Post("support")
  @ApiTags("support")
  @ApiBearerAuth("JWT-auth")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: "Обращение в поддержку",
    description:
      "Создаёт тикет для связи с модератором. При JWT email/имя берутся из профиля.",
  })
  @ApiBody({ type: CreateSupportTicketDto })
  async createSupportTicket(
    @Body() dto: CreateSupportTicketDto,
    @CurrentUser() user?: AuthUser
  ) {
    return this.realityService.createSupportTicket(dto, user);
  }

  @Get("support")
  @ApiTags("support")
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Мои обращения в поддержку",
    description: "Список обращений текущего пользователя со статусами",
  })
  async getSupportTickets(@CurrentUser() user: AuthUser) {
    return this.realityService.getSupportTickets(user.userId);
  }
}
