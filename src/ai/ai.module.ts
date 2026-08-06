import { Module } from "@nestjs/common";
import { AiConfigService } from "./ai-config.service";
import { OpenAiChatService } from "./openai-chat.service";
import { GodOracleService } from "./god-oracle.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [AiConfigService, OpenAiChatService, GodOracleService],
  exports: [GodOracleService, AiConfigService],
})
export class AiModule {}
