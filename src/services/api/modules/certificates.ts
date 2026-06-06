import client, { type ApiResponse, type PaginatedResult } from '../client';
import type { Certificate } from '@/types';

export interface GetCertificatesParams {
  studentId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface ReviewCertificateRequest {
  status: 'approved' | 'rejected';
  remark?: string;
}

export interface GenerateCertificateRequest {
  studentId: string;
  courseId: string;
  score?: number;
}

export type CertificateDetail = Certificate & {
  studentName?: string | null;
  courseTitle?: string;
  reviewerName?: string | null;
};

export const getCertificates = async (
  params?: GetCertificatesParams
): Promise<PaginatedResult<CertificateDetail>> => {
  const response = await client.get<unknown, ApiResponse<PaginatedResult<CertificateDetail>>>(
    '/certificates',
    { params }
  );
  return response.data;
};

export const getCertificate = async (id: string): Promise<CertificateDetail> => {
  const response = await client.get<unknown, ApiResponse<CertificateDetail>>(
    `/certificates/${id}`
  );
  return response.data;
};

export const reviewCertificate = async (
  id: string,
  data: ReviewCertificateRequest
): Promise<CertificateDetail> => {
  const response = await client.put<unknown, ApiResponse<CertificateDetail>>(
    `/certificates/${id}/review`,
    data
  );
  return response.data;
};

export const generateCertificate = async (
  data: GenerateCertificateRequest
): Promise<CertificateDetail> => {
  const response = await client.post<unknown, ApiResponse<CertificateDetail>>(
    '/certificates/generate',
    data
  );
  return response.data;
};
