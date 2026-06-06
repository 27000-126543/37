import client, { type ApiResponse } from '../client';
import type { User, UserRole } from '@/types';

export interface LoginRequest {
  username: string;
  password: string;
  role?: UserRole;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export const login = async (
  username: string,
  password: string,
  role?: UserRole
): Promise<LoginResponse> => {
  const response = await client.post<unknown, ApiResponse<LoginResponse>>('/auth/login', {
    username,
    password,
    role,
  });
  return response.data;
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await client.post<unknown, ApiResponse<{ message: string }>>('/auth/logout');
  return response.data;
};

export const getCurrentUser = async (): Promise<Omit<User, 'password'>> => {
  const response = await client.get<unknown, ApiResponse<Omit<User, 'password'>>>('/auth/me');
  return response.data;
};
