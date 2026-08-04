export type ApiErrorBody = {
  message?: string | string[];
  slavicWisdom?: string;
  guidance?: string;
};

export type ApiResponse<T = Record<string, unknown>> = {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  guidance?: string;
  blessing?: string;
  wisdom?: string;
  effect?: string;
  timestamp?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type PerformRitualPayload = {
  godName: string;
  ritualType: string;
  person: string;
  location: string;
  intensity: number;
  invokerId?: string;
};

export type RegisterPayload = {
  email: string;
  displayName: string;
  password: string;
};

export type SupportTicketPayload = {
  subject: string;
  message: string;
  email?: string;
  displayName?: string;
};

export type FormResultType = 'success' | 'error' | 'info';

export type FormResult = {
  type: FormResultType;
  text: string;
};

export type GodOraclePayload = {
  godName: string;
  intention: string;
  userId?: string;
  offering?: { type: string; purity?: number; significance?: number };
};

export type GodListItem = {
  id: string;
  name: string;
  domain: string;
  element: string;
  description: string;
  preferredOfferings: string[];
  symbols: string[];
  realms: string[];
};

export type AuthUserDto = {
  id: string;
  email: string;
  displayName: string;
  emailConfirmed?: boolean;
};

export type LoginResponseData = {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: AuthUserDto;
};

export type RegisterResponseData = {
  userId: string;
  email: string;
  emailConfirmed: boolean;
  confirmationUrl?: string;
};

export type RitualHistoryItem = {
  id: string;
  userId: string;
  ritualTypeId: string;
  godId: string | null;
  ritualSlug: string;
  ritualName: string;
  person: string;
  location: string;
  intensity: number;
  success: boolean;
  result: Record<string, unknown>;
  createdAt: string;
};

export type OracleHistoryItem = {
  id: string;
  userId: string | null;
  godId: string;
  intention: string;
  offering: Record<string, unknown> | null;
  prophecy: string;
  model: string;
  createdAt: string;
};

export type SupportTicketStatus = 'new' | 'in_review' | 'answered' | 'closed';

export type SupportTicketItem = {
  id: string;
  userId: string | null;
  email: string;
  displayName: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  moderatorReply: string | null;
  createdAt: string;
  updatedAt: string;
};
