export type UserRole = 'admin' | 'dean' | 'teacher' | 'assistant' | 'student' | 'academic' | 'lecturer' | 'guest';

export type QuestionType = 'single' | 'multiple' | 'judge' | 'fill' | 'short' | 'essay' | 'boolean' | 'subjective';

export type CourseStatus = 'draft' | 'published' | 'archived' | 'online' | 'pending' | 'reviewing';

export type CoursewareType = 'video' | 'pdf' | 'ppt' | 'doc';

export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'grading' | 'graded' | 'overdue' | 'pending_grader' | 'pending_teacher_review';

export type GradingStatus = 'pending' | 'assistant_graded' | 'teacher_graded' | 'auto_graded' | 'needs_review';

export type UserStatus = 'active' | 'inactive' | 'disabled';

export type ExamStatus = 'draft' | 'not_started' | 'in_progress' | 'ended' | 'published';

export type LiveSessionStatus = 'not_started' | 'live' | 'ended';

export type CertificateStatus = 'valid' | 'revoked' | 'pending' | 'approved' | 'rejected';

export type ApplicationStatus =
  | 'pending_first_review'
  | 'first_review_passed'
  | 'first_review_rejected'
  | 'pending_final_review'
  | 'final_review_passed'
  | 'final_review_rejected'
  | 'overdue'
  | 'pending_dean'
  | 'pending_expert'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'pending';

export interface User {
  id: string;
  role: UserRole;
  username: string;
  password: string;
  realName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  status: UserStatus;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  subject?: string | null;
  description?: string | null;
  cover?: string | null;
  credits: number;
  teacherId?: string | null;
  status: CourseStatus;
  createdAt: string;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  orderNo: number;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  type?: string | null;
  duration: number;
  content?: string | null;
}

export interface Material {
  id: string;
  courseId: string;
  filename: string;
  url: string;
  size: number;
  type?: string | null;
  createdAt: string;
}

export interface Question {
  id: string;
  courseId: string;
  type: QuestionType;
  content: string;
  options?: string | null;
  answer: string;
  score: number;
  explanation?: string | null;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  createdAt: string;
}

export interface AssignmentQuestion {
  id: string;
  assignmentId: string;
  type: QuestionType;
  content: string;
  options?: string | null;
  answer: string;
  score: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  objectiveScore: number;
  subjectiveScore: number;
  totalScore: number;
  status: AssignmentStatus | GradingStatus | string;
  gradedAt?: string | null;
  graderId?: string | null;
  escalatedAt?: string | null;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  duration: number;
  totalScore: number;
  passScore: number;
  questionCount: number;
  startTime?: string | null;
  endTime?: string | null;
  status: ExamStatus;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  type: QuestionType;
  content: string;
  options?: string | null;
  answer: string;
  score: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string | null;
  score: number;
  passed: number | boolean;
  switchCount: number;
  answers?: string | null;
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  issuedAt?: string | null;
  status: CertificateStatus;
  reviewedAt?: string | null;
  reviewerId?: string | null;
  remark?: string | null;
}

export interface LearningBehavior {
  id: string;
  studentId: string;
  courseId?: string | null;
  lessonId?: string | null;
  watchDuration: number;
  completed: number | boolean;
  createdAt: string;
}

export interface CourseApplication {
  id: string;
  teacherId: string;
  title: string;
  subject?: string | null;
  outline?: string | null;
  cv?: string | null;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewerId?: string | null;
  remark?: string | null;
  autoRejectedAt?: string | null;
}

export interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  startTime?: string | null;
  endTime?: string | null;
  status: LiveSessionStatus;
  recordingUrl?: string | null;
}

export interface Danmaku {
  id: string;
  liveSessionId: string;
  userId: string;
  content: string;
  isBlocked: number | boolean;
  blockReason?: string | null;
  createdAt: string;
}

export interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
