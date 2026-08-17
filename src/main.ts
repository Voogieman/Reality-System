import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { RealityModule } from "./reality/reality.module";
import { SlavicExceptionFilter } from "./common/filters/slavic-exception.filter";
import { mountFrontendSpa } from "./spa";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(RealityModule);
  const configuredAppBaseUrl = process.env.APP_BASE_URL?.trim();

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
  const docBuilder = new DocumentBuilder()
    .setTitle("Slavic Reality System API")
    .setVersion("1.1")
    .setDescription(
      [
        "API славянской реальности: JWT-авторизация, ритуалы с модерацией, ИИ-оракул и поддержка.",
        "",
        "### Как начать тестирование",
        "1. `POST /reality/auth/register`",
        "2. `GET /reality/auth/confirm-email?token=...` (ссылка в ответе регистрации)",
        "3. `POST /reality/auth/login` → `accessToken`",
        "4. Authorize (кнопка) → `Bearer <accessToken>`",
        "",
        "### Важно",
        "- для обычных пользователей ритуалы проходят модерацию;",
        "- для администратора `vugarguliev333@gmail.com` ритуал исполняется сразу.",
      ].join("\n")
    )
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
    );

  docBuilder.addServer("http://localhost:3000", "Local development");
  if (configuredAppBaseUrl) {
    docBuilder.addServer(configuredAppBaseUrl, "Configured APP_BASE_URL");
  }
  const config = docBuilder.build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  mountFrontendSpa(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🌄 Slavic Reality System запущена на порту ${port}`);
  console.log(`📚 Swagger документация: http://localhost:${port}/api`);
}
bootstrap();
