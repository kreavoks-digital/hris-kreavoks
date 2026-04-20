export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  [key: string]: any;
}

export interface ChangePasswordData {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password?: string;
  confirmPassword?: string;
}
