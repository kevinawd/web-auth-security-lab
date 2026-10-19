export interface LoginUser {
  username: string;
  email: string;
  displayName: string;
}

export interface LoginResponse {
  ok: boolean;
  isDemo?: boolean;
  message: string;
  user?: LoginUser;
  errors?: string[];
}
