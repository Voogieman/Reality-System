import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RealityModule } from './reality/reality.module';
import { SlavicExceptionFilter } from './common/filters/slavic-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(RealityModule);

    // Global validation
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
    }));

    // Custom Slavic exception filter
    //app.useGlobalFilters(new SlavicExceptionFilter());

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Slavic Reality System API')
        .setDescription('API для управления славянской реальностью и взаимодействия с богами')
        .setVersion('1.0')
        .addTag('bloodline', 'Операции с родовой линией')
        .addTag('gods', 'Взаимодействие с богами')
        .addTag('balance', 'Управление балансом миров')
        .addTag('rituals', 'Магические ритуалы')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
    console.log('🌄 Slavic Reality System запущена на порту 3000');
    console.log('📚 Swagger документация: http://localhost:3000/api');
}
bootstrap();