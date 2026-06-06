import client, { type ApiResponse } from '../client';

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  completionRate: number;
  passRate: number;
  teacherStudentRatio: number;
}

export interface TrendItem {
  date: string;
  newUsers: number;
  newCourses: number;
  learningActivities: number;
  completedLessons: number;
}

export interface SubjectDistributionItem {
  subject: string;
  courseCount: number;
  percentage: number;
}

export interface MonthlyExamPassItem {
  month: string;
  total: number;
  passed: number;
  passRate: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await client.get<unknown, ApiResponse<DashboardStats>>(
    '/dashboard/stats'
  );
  return response.data;
};

export const getTrend = async (days?: number): Promise<TrendItem[]> => {
  const response = await client.get<unknown, ApiResponse<TrendItem[]>>(
    '/dashboard/trend',
    { params: { days } }
  );
  return response.data;
};

export const getSubjectDistribution = async (): Promise<SubjectDistributionItem[]> => {
  const response = await client.get<unknown, ApiResponse<SubjectDistributionItem[]>>(
    '/dashboard/subject-distribution'
  );
  return response.data;
};

export const getMonthlyExamPass = async (): Promise<MonthlyExamPassItem[]> => {
  const response = await client.get<unknown, ApiResponse<MonthlyExamPassItem[]>>(
    '/dashboard/monthly-exam-pass'
  );
  return response.data;
};
