import client, { type ApiResponse } from '../client';

export interface DimensionScore {
  key: string;
  label: string;
  score: number;
}

export interface SixDimensionScores {
  programming: number;
  theory: number;
  practice: number;
  expression: number;
  collaboration: number;
  innovation: number;
}

export interface StudentAbilityResponse {
  student: {
    id: string;
    name: string;
  };
  dimensions: DimensionScore[];
  rawScores: SixDimensionScores;
  overallScore: number;
  generatedAt: string;
}

export interface WeeklyDurationItem {
  date: string;
  watchDuration: number;
}

export interface WeeklyLearningSummary {
  totalDuration: number;
  averageDaily: number;
  activeDays: number;
  totalDays: number;
}

export interface WeeklyLearningResponse {
  days: WeeklyDurationItem[];
  weeks: number;
  summary: WeeklyLearningSummary;
}

export interface WeaknessRelatedCourse {
  id: string;
  title: string;
  subject: string | null;
}

export interface WeaknessItem {
  knowledgePoint: string;
  scoreRate: number;
  relatedCourses: WeaknessRelatedCourse[];
}

export interface WeaknessesResponse {
  weaknesses: WeaknessItem[];
  totalWeaknesses: number;
  generatedAt: string;
}

export interface TimelineEvent {
  id: string;
  type: 'learning' | 'submission' | 'attempt';
  title: string;
  description: string;
  courseId: string | null;
  courseTitle: string | null;
  createdAt: string;
  details: Record<string, unknown>;
}

export interface TimelineTypes {
  learning: number;
  submission: number;
  attempt: number;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  total: number;
  types: TimelineTypes;
}

export const getStudentAbility = async (
  studentId: string
): Promise<StudentAbilityResponse> => {
  const response = await client.get<unknown, ApiResponse<StudentAbilityResponse>>(
    `/analytics/student/${studentId}`
  );
  return response.data;
};

export const getWeeklyLearning = async (
  studentId: string,
  weeks?: number
): Promise<WeeklyLearningResponse> => {
  const response = await client.get<unknown, ApiResponse<WeeklyLearningResponse>>(
    `/analytics/student/${studentId}/weekly`,
    { params: { weeks } }
  );
  return response.data;
};

export const getWeaknesses = async (
  studentId: string
): Promise<WeaknessesResponse> => {
  const response = await client.get<unknown, ApiResponse<WeaknessesResponse>>(
    `/analytics/student/${studentId}/weaknesses`
  );
  return response.data;
};

export const getTimeline = async (
  studentId: string
): Promise<TimelineResponse> => {
  const response = await client.get<unknown, ApiResponse<TimelineResponse>>(
    `/analytics/student/${studentId}/timeline`
  );
  return response.data;
};
