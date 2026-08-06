export type OracleResponseFormat = {
  sections: string[];
  minParagraphs: number;
  maxParagraphs: number;
  closingStyle: string;
};

export type GodOracleProfile = {
  /** Краткий эпитет для system prompt */
  epithet: string;
  /** Мифологический канон — факты, роли, противостояния */
  lore: string[];
  /** Как говорит божество */
  voiceRules: string[];
  /** Образы и метафоры, которые можно использовать */
  imagery: string[];
  /** Чего избегать в ответе */
  taboos: string[];
  /** Структура ответа */
  responseFormat: OracleResponseFormat;
  /** Температура LLM (0–1), выше = образнее */
  temperature?: number;
  /** Доп. инструкции при слабом подношении */
  lowOfferingTone?: string;
  /** Доп. инструкции при сильном подношении */
  highOfferingTone?: string;
};
