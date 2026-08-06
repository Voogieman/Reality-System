export interface JwtPayload {
  sub: string;
  email: string;
  displayName: string;
  sid: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  sessionId: string;
}
