import { Controller, Post, Body, Get, Param, Put, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RealityService } from './reality.service';
import { AwakenBloodlineDto } from './dto/awaken-bloodline.dto';
import { ContactGodDto } from './dto/contact-god.dto';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { PerformRitualDto } from './dto/perform-ritual.dto';

@ApiTags('reality')
@Controller('reality')
export class RealityController {
    constructor(private readonly realityService: RealityService) {}

    @Post('awaken-bloodline')
    @ApiOperation({
        summary: 'Пробуждение родовой крови',
        description: 'Активация наследственных сил предков и пробуждение родовой памяти'
    })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Родовая кровь успешно пробуждена' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Ошибка верификации родовой линии' })
    @ApiBody({ type: AwakenBloodlineDto })
    async awakenBloodline(@Body() awakenDto: AwakenBloodlineDto) {
        return this.realityService.awakenBloodline(awakenDto);
    }

    @Post('gods/contact')
    @ApiOperation({
        summary: 'Контакт с богом',
        description: 'Установление связи с одним из славянских богов и получение божественного дара'
    })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Контакт успешно установлен' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Дух не готов к божественному контакту' })
    @ApiBody({ type: ContactGodDto })
    async contactGod(@Body() contactDto: ContactGodDto) {
        return this.realityService.contactGod(contactDto);
    }

    @Post('balance/create')
    @ApiOperation({
        summary: 'Создание баланса',
        description: 'Создание точки равновесия между мирами Яви, Прави и Нави'
    })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Баланс успешно создан' })
    @ApiBody({ type: CreateBalanceDto })
    async createBalance(@Body() balanceDto: CreateBalanceDto) {
        return this.realityService.createBalance(balanceDto);
    }

    @Post('rituals/perform')
    @ApiOperation({
        summary: 'Выполнение ритуала',
        description: 'Проведение магического ритуала для воздействия на реальность'
    })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Ритуал успешно выполнен' })
    @ApiBody({ type: PerformRitualDto })
    async performRitual(@Body() ritualDto: PerformRitualDto) {
        return this.realityService.performRitual(ritualDto);
    }

    @Get('character/:id')
    @ApiOperation({
        summary: 'Получение информации о персонаже',
        description: 'Получение полной информации о Вугаре - последнем хранителе'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Информация о персонаже' })
    @ApiParam({ name: 'id', description: 'ID персонажа', example: 'vugar_guliev' })
    async getCharacter(@Param('id') id: string) {
        return this.realityService.getCharacter(id);
    }

    @Get('scenes/:act')
    @ApiOperation({
        summary: 'Получение сцен по актам',
        description: 'Получение списка сцен для указанного акта сценария'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Список сцен' })
    @ApiParam({ name: 'act', description: 'Номер акта', example: '1' })
    async getScenes(@Param('act') act: string) {
        return this.realityService.getScenes(act);
    }

    @Put('skills/upgrade')
    @ApiOperation({
        summary: 'Улучшение навыков',
        description: 'Повышение уровня технических или магических навыков персонажа'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Навыки успешно улучшены' })
    async upgradeSkills(@Body() upgradeDto: any) {
        return this.realityService.upgradeSkills(upgradeDto);
    }

    @Get('status')
    @ApiOperation({
        summary: 'Статус системы',
        description: 'Получение текущего статуса всей славянской реальной системы'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Статус системы' })
    async getSystemStatus() {
        return this.realityService.getSystemStatus();
    }
}