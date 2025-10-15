import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class SlavicExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        const slavicResponse = {
            success: false,
            message: exception.message,
            timestamp: new Date().toISOString(),
            path: request.url,
            slavicWisdom: this.getSlavicWisdom(status),
            guidance: this.getGuidance(status),
            nextSteps: this.getNextSteps(exception)
        };

        response.status(status).json(slavicResponse);
    }

    private getSlavicWisdom(status: number): string {
        const wisdom = {
            400: 'Торопливый дважды дело делает. Подумай прежде чем действовать.',
            401: 'Чужая душа - потёмки. Покажи чистоту своих намерений.',
            403: 'Не в свои сани не садись. Сила требует ответственности.',
            404: 'Ищи да обрящешь. Возможно, ты ищешь не там.',
            409: 'Двум медведям в одной берлоге не ужиться. Конфликт неизбежен.',
            500: 'И на старуху бывает проруха. Даже боги ошибаются.',
            503: 'Не всё коту масленица. Система временно недоступна.'
        };
        return wisdom[status] || 'Что посеешь, то и пожнёшь. Всё происходит по воле богов.';
    }

    private getGuidance(status: number): string {
        const guidance = {
            400: 'Проверь свои данные и попробуй снова.',
            401: 'Укрепи свой дух и вернись с чистыми помыслами.',
            403: 'Обрети необходимые силы или обратись к старшим.',
            404: 'Ищи мудрость в знаках природы и древних текстах.',
            409: 'Найди компромисс или выбери другой путь.',
            500: 'Отдохни и попробуй позже. Всё наладится.',
            503: 'Подожди пока боги восстановят порядок.'
        };
        return guidance[status] || 'Обратись к мудрости предков и попробуй снова.';
    }

    private getNextSteps(exception: HttpException): string[] {
        const steps = ['Отдохни и наберись сил', 'Посоветуйся с волхвом', 'Проверь ритуальные компоненты'];

        if (exception.getStatus() === 404) {
            steps.push('Ищи в других местах силы');
            steps.push('Проверь древние карты');
        }

        if (exception.getStatus() === 403) {
            steps.push('Улучши свои навыки');
            steps.push('Получи благословение богов');
        }

        return steps;
    }
}