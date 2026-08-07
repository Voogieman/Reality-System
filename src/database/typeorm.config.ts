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
  const host = process.env.POSTGRES_HOST ?? "127.0.0.1";
  const sslExplicit = process.env.POSTGRES_SSL;
  const useSsl =
    typeof sslExplicit === "string"
      ? sslExplicit === "true"
      : process.env.NODE_ENV === "production" || host.includes("render.com");

  return {
    type: "postgres",
    host,
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
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  };
}
