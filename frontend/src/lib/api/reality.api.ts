import { apiRequest } from './client';
import type {
  ApiResponse,
  AuthUserDto,
  GodListItem,
  GodOraclePayload,
  LoginPayload,
  LoginResponseData,
  OracleFeedbackPayload,
  OracleHistoryItem,
  GodMatchPayload,
  PerformRitualPayload,
  RegisterPayload,
  RegisterResponseData,
  RitualHistoryItem,
  SupportTicketItem,
  SupportTicketPayload,
  TelegramAuthPayload,
} from './types';

export const realityApi = {
  getGods: () =>
    apiRequest<ApiResponse<{ data: GodListItem[]; aiOracleEnabled?: boolean }>>('/reality/gods'),

  askOracle: (payload: GodOraclePayload) =>
    apiRequest<ApiResponse>('/reality/gods/oracle', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: true,
    }),

  getOracleHistory: () =>
    apiRequest<ApiResponse<OracleHistoryItem[]>>('/reality/oracle/history', { auth: true }),

  getRitualTypes: () => apiRequest<ApiResponse>('/reality/rituals/types'),

  getRitualHistory: () =>
    apiRequest<ApiResponse<RitualHistoryItem[]>>('/reality/rituals/history', { auth: true }),

  performRitual: (payload: PerformRitualPayload) =>
    apiRequest<ApiResponse>('/reality/rituals/perform', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: true,
    }),

  register: (payload: RegisterPayload) =>
    apiRequest<ApiResponse<RegisterResponseData>>('/reality/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  confirmEmail: (token: string) =>
    apiRequest<ApiResponse>(
      `/reality/auth/confirm-email?token=${encodeURIComponent(token)}`,
    ),

  login: (payload: LoginPayload) =>
    apiRequest<ApiResponse<LoginResponseData>>('/reality/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<ApiResponse>('/reality/auth/logout', {
      method: 'POST',
      auth: true,
    }),

  me: () => apiRequest<ApiResponse<AuthUserDto>>('/reality/auth/me', { auth: true }),

  createSupportTicket: (payload: SupportTicketPayload) =>
    apiRequest<ApiResponse<SupportTicketItem>>('/reality/support', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: true,
    }),

  getSupportTickets: () =>
    apiRequest<ApiResponse<SupportTicketItem[]>>('/reality/support', { auth: true }),

  matchGod: (payload: GodMatchPayload) =>
    apiRequest<ApiResponse>('/reality/gods/match', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: true,
    }),

  oracleFeedback: (payload: OracleFeedbackPayload) =>
    apiRequest<ApiResponse>('/reality/gods/oracle/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: true,
    }),

  loginTelegram: (payload: TelegramAuthPayload) =>
    apiRequest<ApiResponse<LoginResponseData>>('/reality/auth/telegram', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  telegramConfig: () =>
    apiRequest<ApiResponse<{ botUsername?: string | null; enabled?: boolean }>>(
      '/reality/auth/telegram/config',
    ),

  telegramStatus: () =>
    apiRequest<ApiResponse<{ linked?: boolean; username?: string | null; botUsername?: string | null; enabled?: boolean }>>(
      '/reality/auth/telegram',
      { auth: true },
    ),

  linkTelegram: () =>
    apiRequest<ApiResponse<{ token?: string; botUsername?: string | null; deepLink?: string | null; enabled?: boolean }>>(
      '/reality/auth/telegram/link',
      { method: 'POST', auth: true },
    ),
};
