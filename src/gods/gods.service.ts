import { Injectable, NotFoundException } from "@nestjs/common";
import { SLAVIC_GODS } from "./slavic-gods.constants";

@Injectable()
export class GodsService {
  getAllGods() {
    return Object.entries(SLAVIC_GODS).map(([id, god]) => ({
      id,
      name: god.name,
      domain: god.domain,
      element: god.element,
      description: god.description,
      preferredOfferings: god.preferredOfferings,
      symbols: god.symbols,
      realms: god.realms,
    }));
  }

  getGodById(godName: string) {
    const god = SLAVIC_GODS[godName];
    if (!god) {
      throw new NotFoundException(`Бог ${godName} не найден`);
    }
    return { id: godName, ...god };
  }
}
