import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PerformRitualDto } from "../reality/dto/perform-ritual.dto";
import { DatabaseService } from "../database/database.service";
import { SLAVIC_GODS } from "../gods/slavic-gods.constants";
import type { RitualModerationStatus } from "../database/entities";
import type { AuthUser } from "../auth/jwt-payload.interface";

@Injectable()
export class RitualsService {
  private readonly defaultIntensity = 76;
  private readonly defaultLocation = "Священная роща";
  private readonly adminEmail = "vugarguliev333@gmail.com";

  constructor(private readonly databaseService: DatabaseService) {}

  async getRitualTypes() {
    if (!this.databaseService.isAvailable()) {
      throw new ServiceUnavailableException("База данных недоступна");
    }

    const types = await this.databaseService.getAllRitualTypes();
    return types.map((type) => ({
      slug: type.slug,
      name: type.name,
      type: type.type,
      requiredComponents: type.requiredComponents,
      energyCost: type.energyCost,
      duration: type.duration,
      successRate: type.successRate,
    }));
  }

  async getRitualHistory(userId: string) {
    if (!this.databaseService.isAvailable()) {
      throw new ServiceUnavailableException("База данных недоступна");
    }

    await this.progressRitualModeration(userId);
    return this.databaseService.getRitualHistoryByUserId(userId);
  }

  async performRitual(ritualDto: PerformRitualDto, authUser?: AuthUser) {
    if (!this.databaseService.isAvailable()) {
      throw new ServiceUnavailableException("База данных недоступна");
    }

    const { ritualType, person, godName } = ritualDto;
    const invokerId = ritualDto.invokerId;
    const location = ritualDto.location?.trim() || this.defaultLocation;
    const intensity = ritualDto.intensity ?? this.defaultIntensity;
    if (!invokerId) {
      throw new BadRequestException(
        "Укажите invokerId или авторизуйтесь по JWT"
      );
    }
    const chosenGod = SLAVIC_GODS[godName];
    if (!chosenGod) {
      throw new NotFoundException(`Бог "${godName}" не найден в пантеоне`);
    }

    const ritualTemplate = await this.databaseService.getRitualTypeBySlug(
      ritualType
    );

    if (!ritualTemplate) {
      throw new NotFoundException(`Ритуал типа "${ritualType}" не найден`);
    }

    if (intensity > 100 || intensity < 1) {
      throw new BadRequestException(
        "Интенсивность ритуала должна быть от 1 до 100"
      );
    }

    const recordId = `ritual_${Date.now()}_${Math.floor(
      Math.random() * 100000
    )}`;
    const moderationEtaMinutes = this.getModerationEtaMinutes(recordId);
    const isAdmin = authUser?.email?.toLowerCase() === this.adminEmail;
    const projected = this.executeRitual(ritualTemplate, {
      ...ritualDto,
      intensity,
      location,
    });
    const moderationStatus: RitualModerationStatus = isAdmin
      ? "completed"
      : "submitted_for_review";
    const completedAt = isAdmin ? new Date() : null;

    await this.databaseService.saveRitualHistory({
      id: recordId,
      userId: invokerId,
      ritualTypeId: ritualTemplate.id,
      godId: godName,
      person,
      location,
      intensity,
      moderationStatus,
      moderationEtaMinutes: isAdmin ? 0 : moderationEtaMinutes,
      moderationReason: null,
      completedAt,
      success: isAdmin,
      result: {
        godId: godName,
        godName: chosenGod.name,
        queuedAt: new Date().toISOString(),
        projected,
        completedAt: completedAt?.toISOString() ?? null,
        moderation: {
          etaMinutes: isAdmin ? 0 : moderationEtaMinutes,
        },
      },
    });

    return {
      id: recordId,
      godId: godName,
      godName: chosenGod.name,
      moderationStatus,
      moderationEtaMinutes: isAdmin ? 0 : moderationEtaMinutes,
      moderationReason: null,
      location,
      invokerId,
      person,
      intensity,
      timestamp: new Date().toISOString(),
      message: isAdmin
        ? "Ритуал выполнен сразу (режим администратора)"
        : "Ритуал отправлен на модерацию",
      advice: isAdmin
        ? "Ритуал выполнен без очереди модерации."
        : `Проверка модератором займёт ${moderationEtaMinutes}-${Math.min(
            60,
            moderationEtaMinutes + 6
          )} минут.`,
    };
  }

  private async progressRitualModeration(userId: string): Promise<void> {
    const history = await this.databaseService.getRitualHistoryByUserId(userId);
    const now = Date.now();

    for (const ritual of history) {
      const elapsedMinutes = Math.floor(
        (now - ritual.createdAt.getTime()) / (60 * 1000)
      );
      const eta = ritual.moderationEtaMinutes ?? 45;

      if (
        ritual.moderationStatus === "submitted_for_review" &&
        elapsedMinutes >= eta
      ) {
        const accepted = this.isAccepted(ritual.id);
        if (!accepted) {
          await this.databaseService.updateRitualModeration(ritual.id, {
            moderationStatus: "rejected",
            moderationReason: this.getRejectionReason(ritual.id),
            success: false,
            moderatedAt: new Date(),
          });
          continue;
        }

        await this.databaseService.updateRitualModeration(ritual.id, {
          moderationStatus: "accepted_for_execution",
          moderationReason: null,
          success: false,
          moderatedAt: new Date(),
        });
        continue;
      }

      if (
        ritual.moderationStatus === "accepted_for_execution" &&
        elapsedMinutes >= eta + 5
      ) {
        await this.databaseService.updateRitualModeration(ritual.id, {
          moderationStatus: "completed",
          moderationReason: null,
          success: true,
          completedAt: new Date(),
        });
      }
    }
  }

  private getModerationEtaMinutes(seedSource: string): number {
    const seed = this.getStableSeed(seedSource);
    return 30 + (seed % 31);
  }

  private isAccepted(seedSource: string): boolean {
    const seed = this.getStableSeed(seedSource);
    return seed % 100 >= 22;
  }

  private getRejectionReason(seedSource: string): string {
    const reasons = [
      "Недостаточно данных о цели ритуала.",
      "Намерение описано неясно — требуется уточнение формулировки.",
      "Выбранный ритуал не соответствует заявленной цели.",
      "Нужна дополнительная проверка безопасности обряда.",
    ];
    const seed = this.getStableSeed(seedSource);
    return reasons[seed % reasons.length];
  }

  private getStableSeed(source: string): number {
    return [...source].reduce(
      (acc, char, index) => acc + char.charCodeAt(0) * (index + 1),
      0
    );
  }

  private executeRitual(
    template: {
      name: string;
      energyCost: number;
      duration: string;
      successRate: number;
    },
    ritualDto: PerformRitualDto
  ) {
    const { intensity } = ritualDto;
    const baseSuccessRate = template.successRate;
    const intensityBonus = intensity * 0.2;
    const totalSuccessRate = Math.min(95, baseSuccessRate + intensityBonus);
    const success = Math.random() * 100 <= totalSuccessRate;

    return {
      success,
      ritualName: template.name,
      energyCost: template.energyCost,
      actualCost: this.calculateActualEnergyCost(
        template.energyCost,
        intensity
      ),
      successRate: Math.round(totalSuccessRate),
      duration: template.duration,
      powerLevel: this.calculatePowerLevel(intensity, success),
      message: success
        ? this.getSuccessMessage(template.name)
        : this.getFailureMessage(template.name),
    };
  }

  private calculateActualEnergyCost(
    baseCost: number,
    intensity: number
  ): number {
    return Math.round(baseCost * (intensity / 50));
  }

  private calculatePowerLevel(intensity: number, success: boolean): string {
    if (!success) return "НУЛЕВОЙ";
    if (intensity > 90) return "ЛЕГЕНДАРНЫЙ";
    if (intensity > 75) return "ЭПИЧЕСКИЙ";
    if (intensity > 60) return "ВЫСОКИЙ";
    if (intensity > 40) return "СРЕДНИЙ";
    return "НИЗКИЙ";
  }

  private getSuccessMessage(ritualName: string): string {
    const messages: Record<string, string> = {
      Очищение: "Место очищено. Свет изгнал тьму!",
      Благословение: "Боги благословили это место!",
      Освящение: "Святость наполнила пространство!",
      Тканье: "Тени подчинились твоей воле!",
      Соитие: "Силы соединились в гармонии!",
      Предложение: "Договор заключён!",
    };
    return messages[ritualName] || "Ритуал завершён успешно!";
  }

  private getFailureMessage(ritualName: string): string {
    const messages: Record<string, string> = {
      Очищение: "Очищение не удалось. Тьма сопротивляется!",
      Благословение: "Боги не услышали твои молитвы!",
      Освящение: "Святость не снизошла на это место!",
      Тканье: "Тени вышли из-под контроля!",
      Соитие: "Ритуал не удался!",
      Предложение: "Соглашение не состоялось!",
    };
    return messages[ritualName] || "Ритуал провалился!";
  }

  private getRitualAdvice(ritualType: string, success: boolean): string {
    if (success) {
      const advice: Record<string, string> = {
        purification: "Поддерживайте чистоту регулярными малыми ритуалами.",
        blessing: "Благословение будет сильнее при чистоте помыслов.",
        consecration: "Освящённое место требует уважения и заботы.",
        weaving: "Помните: тени должны служить, а не управлять.",
        coition: "Используйте этот ритуал осознанно и с ответственностью.",
        offer: "Перед заключением соглашений проверяйте свои намерения.",
      };
      return advice[ritualType] || "Продолжайте в том же духе!";
    }

    return "Отдохните и попробуйте снова после восстановления энергии.";
  }
}
