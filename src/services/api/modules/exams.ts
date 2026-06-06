import client, { type ApiResponse, type PaginatedResult } from '../client';
import type { Exam, ExamAttempt, Question } from '@/types';

export type ExamQuestion = Question;

export interface GetExamsParams {
  courseId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateExamRequest {
  courseId: string;
  title: string;
  duration?: number;
  totalScore?: number;
  passScore?: number;
  questionCount?: number;
  startTime?: string | null;
  endTime?: string | null;
  status?: string;
}

export interface UpdateExamRequest {
  title?: string;
  duration?: number;
  totalScore?: number;
  passScore?: number;
  questionCount?: number;
  startTime?: string | null;
  endTime?: string | null;
  status?: string;
}

export interface StartExamResult {
  attemptId: string;
  questions: ExamQuestion[];
}

export interface UserAnswer {
  questionId: string;
  answer: string | string[] | boolean | null;
}

export interface GetExamAttemptsParams {
  studentId?: string;
  examId?: string;
}

export const getExams = async (
  params?: GetExamsParams
): Promise<PaginatedResult<Exam>> => {
  const response = await client.get<unknown, ApiResponse<PaginatedResult<Exam>>>(
    '/exams',
    { params }
  );
  return response.data;
};

export const getExam = async (
  id: string
): Promise<Exam & { questions: ExamQuestion[] }> => {
  const response = await client.get<unknown, ApiResponse<Exam & { questions: ExamQuestion[] }>>(
    `/exams/${id}`
  );
  return response.data;
};

export const createExam = async (data: CreateExamRequest): Promise<Exam> => {
  const response = await client.post<unknown, ApiResponse<Exam>>('/exams', data);
  return response.data;
};

export const updateExam = async (
  id: string,
  data: UpdateExamRequest
): Promise<Exam> => {
  const response = await client.put<unknown, ApiResponse<Exam>>(`/exams/${id}`, data);
  return response.data;
};

export const deleteExam = async (id: string): Promise<{ message: string }> => {
  const response = await client.delete<unknown, ApiResponse<{ message: string }>>(
    `/exams/${id}`
  );
  return response.data;
};

export const startExam = async (id: string): Promise<StartExamResult> => {
  const response = await client.post<unknown, ApiResponse<StartExamResult>>(
    `/exams/${id}/start`
  );
  return response.data;
};

export const recordSwitch = async (attemptId: string): Promise<ExamAttempt> => {
  const response = await client.post<unknown, ApiResponse<ExamAttempt>>(
    `/exam-attempts/${attemptId}/switch`
  );
  return response.data;
};

export const submitExam = async (
  attemptId: string,
  answers: UserAnswer[]
): Promise<ExamAttempt> => {
  const response = await client.post<unknown, ApiResponse<ExamAttempt>>(
    `/exam-attempts/${attemptId}/submit`,
    { answers }
  );
  return response.data;
};

export const getExamAttempts = async (
  params?: GetExamAttemptsParams
): Promise<ExamAttempt[]> => {
  const response = await client.get<unknown, ApiResponse<ExamAttempt[]>>(
    '/exam-attempts',
    { params }
  );
  return response.data;
};

export const getExamAttempt = async (id: string): Promise<ExamAttempt> => {
  const response = await client.get<unknown, ApiResponse<ExamAttempt>>(
    `/exam-attempts/${id}`
  );
  return response.data;
};
