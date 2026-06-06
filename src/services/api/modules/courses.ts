import client, { type ApiResponse, type PaginatedResult } from '../client';
import type {
  Course,
  Chapter,
  Lesson,
  Material,
  Question,
  QuestionType,
} from '@/types';

export interface GetCoursesParams {
  subject?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateCourseRequest {
  title: string;
  subject?: string;
  description?: string;
  cover?: string;
  credits?: number;
  teacherId?: string;
  status?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  subject?: string;
  description?: string;
  cover?: string;
  credits?: number;
  teacherId?: string;
  status?: string;
}

export interface CreateChapterRequest {
  title: string;
  orderNo?: number;
}

export interface UpdateChapterRequest {
  title?: string;
  orderNo?: number;
}

export interface CreateLessonRequest {
  chapterId: string;
  title: string;
  type?: string;
  duration?: number;
  content?: string;
}

export interface UpdateLessonRequest {
  title?: string;
  type?: string;
  duration?: number;
  content?: string;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  content: string;
  options?: string;
  answer: string;
  score?: number;
  explanation?: string;
}

export interface UpdateQuestionRequest {
  type?: QuestionType;
  content?: string;
  options?: string;
  answer?: string;
  score?: number;
  explanation?: string;
}

export interface LearningPathResponse {
  courseId: string;
  studentId: string;
  chapters: Array<{
    chapterId: string;
    chapterTitle: string;
    orderNo: number;
    lessons: Array<{
      lessonId: string;
      lessonTitle: string;
      duration: number;
      completed: boolean;
      priority: number;
    }>;
  }>;
  pendingLessons: Array<{
    lessonId: string;
    lessonTitle: string;
    duration: number;
    completed: boolean;
  }>;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  estimatedRemainingMinutes: number;
  learningStyle: string;
  weakPoints: string[];
  strongPoints: string[];
}

export const getCourses = async (
  params?: GetCoursesParams
): Promise<PaginatedResult<Course>> => {
  const response = await client.get<unknown, ApiResponse<PaginatedResult<Course>>>(
    '/courses',
    { params }
  );
  return response.data;
};

export const getCourse = async (id: string): Promise<Course & {
  chapters: (Chapter & { lessons: Lesson[] })[];
  lessons: Lesson[];
  materials: Material[];
  questions: Question[];
}> => {
  const response = await client.get<unknown, ApiResponse<Course & {
    chapters: (Chapter & { lessons: Lesson[] })[];
    lessons: Lesson[];
    materials: Material[];
    questions: Question[];
  }>>(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (data: CreateCourseRequest): Promise<Course> => {
  const response = await client.post<unknown, ApiResponse<Course>>('/courses', data);
  return response.data;
};

export const updateCourse = async (
  id: string,
  data: UpdateCourseRequest
): Promise<Course> => {
  const response = await client.put<unknown, ApiResponse<Course>>(`/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: string): Promise<null> => {
  const response = await client.delete<unknown, ApiResponse<null>>(`/courses/${id}`);
  return response.data;
};

export const getCourseChapters = async (
  courseId: string
): Promise<(Chapter & { lessons: Lesson[] })[]> => {
  const response = await client.get<unknown, ApiResponse<(Chapter & { lessons: Lesson[] })[]>>(
    `/courses/${courseId}/chapters`
  );
  return response.data;
};

export const createChapter = async (
  courseId: string,
  data: CreateChapterRequest
): Promise<Chapter> => {
  const response = await client.post<unknown, ApiResponse<Chapter>>(
    `/courses/${courseId}/chapters`,
    data
  );
  return response.data;
};

export const updateChapter = async (
  id: string,
  data: UpdateChapterRequest
): Promise<Chapter> => {
  const response = await client.put<unknown, ApiResponse<Chapter>>(
    `/courses/chapters/${id}`,
    data
  );
  return response.data;
};

export const deleteChapter = async (id: string): Promise<null> => {
  const response = await client.delete<unknown, ApiResponse<null>>(`/courses/chapters/${id}`);
  return response.data;
};

export const createLesson = async (
  courseId: string,
  data: CreateLessonRequest
): Promise<Lesson> => {
  const response = await client.post<unknown, ApiResponse<Lesson>>(
    `/courses/${courseId}/lessons`,
    data
  );
  return response.data;
};

export const updateLesson = async (
  id: string,
  data: UpdateLessonRequest
): Promise<Lesson> => {
  const response = await client.put<unknown, ApiResponse<Lesson>>(
    `/courses/lessons/${id}`,
    data
  );
  return response.data;
};

export const deleteLesson = async (id: string): Promise<null> => {
  const response = await client.delete<unknown, ApiResponse<null>>(`/courses/lessons/${id}`);
  return response.data;
};

export const uploadMaterial = async (
  courseId: string,
  formData: FormData
): Promise<Material> => {
  const response = await client.post<unknown, ApiResponse<Material>>(
    `/courses/${courseId}/materials`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getCourseMaterials = async (courseId: string): Promise<Material[]> => {
  const response = await client.get<unknown, ApiResponse<Material[]>>(
    `/courses/${courseId}/materials`
  );
  return response.data;
};

export const deleteMaterial = async (id: string): Promise<null> => {
  const response = await client.delete<unknown, ApiResponse<null>>(`/courses/materials/${id}`);
  return response.data;
};

export const getCourseQuestions = async (courseId: string): Promise<Question[]> => {
  const response = await client.get<unknown, ApiResponse<Question[]>>(
    `/courses/${courseId}/questions`
  );
  return response.data;
};

export const createQuestions = async (
  courseId: string,
  questions: CreateQuestionRequest[]
): Promise<Question[]> => {
  const response = await client.post<unknown, ApiResponse<Question[]>>(
    `/courses/${courseId}/questions`,
    { questions }
  );
  return response.data;
};

export const updateQuestion = async (
  id: string,
  data: UpdateQuestionRequest
): Promise<Question> => {
  const response = await client.put<unknown, ApiResponse<Question>>(
    `/courses/questions/${id}`,
    data
  );
  return response.data;
};

export const deleteQuestion = async (id: string): Promise<null> => {
  const response = await client.delete<unknown, ApiResponse<null>>(`/courses/questions/${id}`);
  return response.data;
};

export const getLearningPath = async (
  courseId: string,
  studentId: string
): Promise<LearningPathResponse> => {
  const response = await client.get<unknown, ApiResponse<LearningPathResponse>>(
    `/courses/${courseId}/recommend/${studentId}`
  );
  return response.data;
};
