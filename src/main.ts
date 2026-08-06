import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { RealityModule } from "./reality/reality.module";
import { SlavicExceptionFilter } from "./common/filters/slavic-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(RealityModule);

  app.enableCors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Custom Slavic exception filter
  app.useGlobalFilters(new SlavicExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Slavic Reality System API")
    .setDescription(
      [
        "API славянской реальности: JWT-авторизация, история ритуалов, ИИ-оракул пантеона.",
        "",
        "### JWT",
        "1. `POST /reality/auth/register`",
        "2. `GET /reality/auth/confirm-email?token=...` (ссылка в ответе регистрации)",
        "3. `POST /reality/auth/login` → `accessToken`",
        "4. Authorize (кнопка) → `Bearer <accessToken>`",
      ].join("\n")
    )
    .setVersion("1.0")
    .addTag("auth", "Регистрация, подтверждение email, JWT login/logout")
    .addTag("gods", "Пантеон и ИИ-оракул")
    .addTag("rituals", "Типы и история магических ритуалов")
    .addTag("support", "Обращения к модератору")
    .addTag("reality", "Общий контур Reality API")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT accessToken из /reality/auth/login",
      },
      "JWT-auth"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🌄 Slavic Reality System запущена на порту ${port}`);
  console.log(`📚 Swagger документация: http://localhost:${port}/api`);
}
bootstrap();
