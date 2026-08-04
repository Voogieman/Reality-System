import { Injectable, NotFoundException } from '@nestjs/common';
import { SLAVIC_GODS } from '../gods/slavic-gods.constants';
import { buildOraclePrompt } from './prompts/oracle-prompt.builder';
import { OpenAiChatService } from './openai-chat.service';
import { AiConfigService } from './ai-config.service';
import { DatabaseService } from '../database/database.service';

export type OracleContext = {
    godName: string;
    intention: string;
    offeringType?: string;
    purity?: number;
    significance?: number;
    userId?: string;
};

@Injectable()
export class GodOracleService {
    constructor(
        private readonly chat: OpenAiChatService,
        private readonly config: AiConfigService,
        private readonly databaseService: DatabaseService,
    ) {}

    isAvailable(): boolean {
        return this.config.enabled;
    }

    async speak(context: OracleContext): Promise<{ prophecy: string; model: string; messageId: string }> {
        const god = SLAVIC_GODS[context.godName];
        if (!god) {
            throw new NotFoundException(`Бог ${context.godName} не найден в пантеоне`);
        }

        const { systemMessages, userMessage, temperature } = buildOraclePrompt(context);

        const messages = [
            ...systemMessages.map((content) => ({ role: 'system' as const, content })),
            { role: 'user' as const, content: userMessage },
        ];

        const prophecy = await this.chat.complete(messages, { temperature });
        const messageId = `oracle_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

        if (this.databaseService.isAvailable()) {
            const offering =
                context.offeringType || context.purity !== undefined || context.significance !== undefined
                    ? {
                          type: context.offeringType,
                          purity: context.purity,
                          significance: context.significance,
                      }
                    : null;

            await this.databaseService.saveOracleMessage({
                id: messageId,
                userId: context.userId ?? null,
                godId: context.godName,
                intention: context.intention,
                offering,
                prophecy,
                model: this.config.model,
            });
        }

        return { prophecy, model: this.config.model, messageId };
    }

    async getHistory(userId: string) {
        if (!this.databaseService.isAvailable()) {
            return [];
        }

        return this.databaseService.getOracleHistoryByUserId(userId);
    }
}
