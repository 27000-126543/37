import client, { type ApiResponse, type PaginatedResult } from '../client';
import type {
  Assignment,
  AssignmentQuestion,
  AssignmentSubmission,
  QuestionType,
} from '@/types';

export interface GetAssignmentsParams {
  courseId?: string;
  studentId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface AssignmentQuestionInput {
  id?: string;
  type: QuestionType;
  content: string;
  options?: string | null;
  answer: string;
  score: number;
}

export interface CreateAssignmentRequest {
  courseId: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  questions: AssignmentQuestionInput[];
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string | null;
  deadline?: string | null;
  questions?: AssignmentQuestionInput[];
}

export interface UserAnswer {
  questionId: string;
  answer: string | string[] | boolean | null;
}

export interface GetSubmissionsParams {
  status?: string;
}

export interface GradeSubmissionRequest {
  subjectiveScore: number;
}

export const getAssignments = async (
  params?: GetAssignmentsParams
): Promise<PaginatedResult<Assignment>> => {
  const response = await client.get<unknown, ApiResponse<PaginatedResult<Assignment>>>(
    '/assignments',
    { params }
  );
  return response.data;
};

export const getAssignment = async (
  id: string
): Promise<Assignment & { questions: AssignmentQuestion[] }> => {
  const response = await client.get<unknown, ApiResponse<Assignment & { questions: AssignmentQuestion[] }>>(
    `/assignments/${id}`
  );
  return response.data;
};

export const createAssignment = async (
  data: CreateAssignmentRequest
): Promise<Assignment & { questions: AssignmentQuestion[] }> => {
  const response = await client.post<unknown, ApiResponse<Assignment & { questions: AssignmentQuestion[] }>>(
    '/assignments',
    data
  );
  return response.data;
};

export const updateAssignment = async (
  id: string,
  data: UpdateAssignmentRequest
): Promise<Assignment & { questions: AssignmentQuestion[] }> => {
  const response = await client.put<unknown, ApiResponse<Assignment & { questions: AssignmentQuestion[] }>>(
    `/assignments/${id}`,
    data
  );
  return response.data;
};

export const deleteAssignment = async (id: string): Promise<{ message: string }> => {
  const response = await client.delete<unknown, ApiResponse<{ message: string }>>(
    `/assignments/${id}`
  );
  return response.data;
};

export const getSubmissions = async (
  assignmentId: string,
  params?: GetSubmissionsParams
): Promise<AssignmentSubmission[]> => {
  const response = await client.get<unknown, ApiResponse<AssignmentSubmission[]>>(
    `/assignments/${assignmentId}/submissions`,
    { params }
  );
  return response.data;
};

export const submitAssignment = async (
  assignmentId: string,
  answers: UserAnswer[]
): Promise<AssignmentSubmission> => {
  const response = await client.post<unknown, ApiResponse<AssignmentSubmission>>(
    `/assignments/${assignmentId}/submit`,
    { answers }
  );
  return response.data;
};

export const gradeSubmission = async (
  id: string,
  data: GradeSubmissionRequest
): Promise<AssignmentSubmission> => {
  const response = await client.put<unknown, ApiResponse<AssignmentSubmission>>(
    `/submissions/${id}/grade`,
    data
  );
  return response.data;
};

export const getPendingEscalations = async (): Promise<AssignmentSubmission[]> => {
  const response = await client.get<unknown, ApiResponse<AssignmentSubmission[]>>(
    '/submissions/pending-escalation'
  );
  return response.data;
};
