import { Module } from "@nestjs/common";
import { AiConfigService } from "./ai-config.service";
import { OpenAiChatService } from "./openai-chat.service";
import { GodOracleService } from "./god-oracle.service";
import { GodMatcherService } from "./god-matcher.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [AiConfigService, OpenAiChatService, GodOracleService, GodMatcherService],
  exports: [GodOracleService, GodMatcherService, AiConfigService],
})
export class AiModule {}
