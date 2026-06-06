import client, { type ApiResponse, type PaginatedResult } from '../client';
import type { User, UserRole } from '@/types';

export type UserStatus = 'active' | 'inactive' | 'disabled';

export interface GetUsersParams {
  role?: UserRole;
  page?: number;
  pageSize?: number;
}

export interface CreateUserRequest {
  username: string;
  password?: string;
  role?: UserRole;
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
}

export interface UpdateUserRequest {
  role?: UserRole;
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
}

export const getUsers = async (
  params?: GetUsersParams
): Promise<PaginatedResult<Omit<User, 'password'>>> => {
  const response = await client.get<unknown, ApiResponse<PaginatedResult<Omit<User, 'password'>>>>(
    '/users',
    { params }
  );
  return response.data;
};

export const createUser = async (
  data: CreateUserRequest
): Promise<Omit<User, 'password'>> => {
  const response = await client.post<unknown, ApiResponse<Omit<User, 'password'>>>(
    '/users',
    data
  );
  return response.data;
};

export const updateUser = async (
  id: string,
  data: UpdateUserRequest
): Promise<Omit<User, 'password'>> => {
  const response = await client.put<unknown, ApiResponse<Omit<User, 'password'>>>(
    `/users/${id}`,
    data
  );
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await client.delete<unknown, ApiResponse<{ message: string }>>(
    `/users/${id}`
  );
  return response.data;
};

export const updateUserStatus = async (
  id: string,
  status: UserStatus
): Promise<Omit<User, 'password'>> => {
  const response = await client.patch<unknown, ApiResponse<Omit<User, 'password'>>>(
    `/users/${id}/status`,
    { status }
  );
  return response.data;
};

export const resetPassword = async (id: string): Promise<{ message: string }> => {
  const response = await client.post<unknown, ApiResponse<{ message: string }>>(
    `/users/${id}/reset-password`
  );
  return response.data;
};
