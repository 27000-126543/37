import client, { type ApiResponse, type PaginatedResult } from '../client';
import type { CourseApplication } from '@/types';

export interface GetApplicationsParams {
  status?: string;
  teacherId?: string;
  page?: number;
  pageSize?: number;
}

export interface SubmitApplicationRequest {
  title: string;
  subject?: string;
  outline?: string;
  cv?: string;
}

export interface DeanReviewRequest {
  status: 'pending_expert' | 'rejected';
  remark?: string;
}

export interface ExpertReviewRequest {
  status: 'approved' | 'rejected';
  remark?: string;
}

export interface CheckAutoRejectResult {
  processedCount: number;
}

export type ApplicationDetail = CourseApplication & {
  teacherName?: string | null;
  teacherEmail?: string | null;
  reviewerName?: string | null;
};

export const getApplications = async (
  params?: GetApplicationsParams
): Promise<PaginatedResult<ApplicationDetail>> => {
  const response = await client.get<unknown, ApiResponse<PaginatedResult<ApplicationDetail>>>(
    '/applications',
    { params }
  );
  return response.data;
};

export const getApplication = async (id: string): Promise<ApplicationDetail> => {
  const response = await client.get<unknown, ApiResponse<ApplicationDetail>>(
    `/applications/${id}`
  );
  return response.data;
};

export const submitApplication = async (
  data: SubmitApplicationRequest
): Promise<ApplicationDetail> => {
  const response = await client.post<unknown, ApiResponse<ApplicationDetail>>(
    '/applications',
    data
  );
  return response.data;
};

export const deanReview = async (
  id: string,
  data: DeanReviewRequest
): Promise<ApplicationDetail> => {
  const response = await client.put<unknown, ApiResponse<ApplicationDetail>>(
    `/applications/${id}/dean-review`,
    data
  );
  return response.data;
};

export const expertReview = async (
  id: string,
  data: ExpertReviewRequest
): Promise<ApplicationDetail> => {
  const response = await client.put<unknown, ApiResponse<ApplicationDetail>>(
    `/applications/${id}/expert-review`,
    data
  );
  return response.data;
};

export const checkAutoReject = async (): Promise<CheckAutoRejectResult> => {
  const response = await client.get<unknown, ApiResponse<CheckAutoRejectResult>>(
    '/applications/check-auto-reject'
  );
  return response.data;
};
