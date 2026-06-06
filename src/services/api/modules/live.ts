import client, { type ApiResponse, type PaginatedResult } from '../client';
import type { Danmaku, LiveSession } from '@/types';

export interface GetLiveSessionsParams {
  courseId?: string;
  status?: 'not_started' | 'live' | 'ended';
  page?: number;
  pageSize?: number;
}

export interface CreateLiveRequest {
  courseId: string;
  title: string;
  startTime?: string | null;
  endTime?: string | null;
}

export interface UpdateLiveRequest {
  title?: string;
  startTime?: string | null;
  endTime?: string | null;
  status?: 'not_started' | 'live' | 'ended';
  recordingUrl?: string | null;
}

export interface SendDanmakuRequest {
  content: string;
}

export const getLiveSessions = async (
  params?: GetLiveSessionsParams
): Promise<PaginatedResult<LiveSession>> => {
  const response = await client.get<unknown, ApiResponse<PaginatedResult<LiveSession>>>(
    '/live',
    { params }
  );
  return response.data;
};

export const getLiveSession = async (id: string): Promise<LiveSession> => {
  const response = await client.get<unknown, ApiResponse<LiveSession>>(`/live/${id}`);
  return response.data;
};

export const createLiveSession = async (
  data: CreateLiveRequest
): Promise<LiveSession> => {
  const response = await client.post<unknown, ApiResponse<LiveSession>>('/live', data);
  return response.data;
};

export const updateLiveSession = async (
  id: string,
  data: UpdateLiveRequest
): Promise<LiveSession> => {
  const response = await client.put<unknown, ApiResponse<LiveSession>>(`/live/${id}`, data);
  return response.data;
};

export const deleteLiveSession = async (id: string): Promise<{ message: string }> => {
  const response = await client.delete<unknown, ApiResponse<{ message: string }>>(`/live/${id}`);
  return response.data;
};

export const getDanmakus = async (
  sessionId: string,
  includeBlocked = false
): Promise<Danmaku[]> => {
  const response = await client.get<unknown, ApiResponse<Danmaku[]>>(
    `/danmakus/${sessionId}`,
    { params: { includeBlocked: includeBlocked ? 'true' : 'false' } }
  );
  return response.data;
};

export const sendDanmaku = async (
  sessionId: string,
  data: SendDanmakuRequest
): Promise<Danmaku> => {
  const response = await client.post<unknown, ApiResponse<Danmaku>>(
    `/danmakus/${sessionId}`,
    data
  );
  return response.data;
};

export const deleteDanmaku = async (danmakuId: string): Promise<{ message: string }> => {
  const response = await client.delete<unknown, ApiResponse<{ message: string }>>(
    `/danmakus/${danmakuId}`
  );
  return response.data;
};
