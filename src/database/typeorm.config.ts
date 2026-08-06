import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import {
  EmailConfirmationTokenEntity,
  OracleMessageEntity,
  RitualHistoryEntity,
  RitualTypeEntity,
  SessionEntity,
  SupportTicketEntity,
  UserEntity,
} from "./entities";

export function buildTypeOrmConfig(): TypeOrmModuleOptions {
  return {
    type: "postgres",
    host: process.env.POSTGRES_HOST ?? "127.0.0.1",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? "postgres",
    password: process.env.POSTGRES_PASSWORD ?? "postgres",
    database: process.env.POSTGRES_DATABASE ?? "magic13_local",
    entities: [
      UserEntity,
      EmailConfirmationTokenEntity,
      SessionEntity,
      RitualTypeEntity,
      RitualHistoryEntity,
      OracleMessageEntity,
      SupportTicketEntity,
    ],
    synchronize: process.env.TYPEORM_SYNCHRONIZE !== "false",
    logging: process.env.TYPEORM_LOGGING === "true",
  };
}
