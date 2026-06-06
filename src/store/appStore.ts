import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Course,
  Assignment,
  Exam,
  Certificate,
  CourseApplication,
  DashboardStats,
  User,
  AssignmentSubmission,
  ExamAttempt,
  LiveSession,
  LearningPath,
  ReviewRecord,
  GradingStatus,
  AssignmentQuestionWithAnswer,
} from '@/types';
import {
  mockCourses,
  mockAssignments,
  mockAssignmentSubmissions,
  mockExams,
  mockExamAttempts,
  mockCertificates,
  mockApplications,
  mockReviewRecords,
  mockDashboardStats,
  mockUsers,
} from '@/data';

const generateId = (prefix: string) => `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface AppState {
  users: User[];
  courses: Course[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  certificates: Certificate[];
  applications: CourseApplication[];
  reviewRecords: ReviewRecord[];
  liveSessions: LiveSession[];
  learningPaths: LearningPath[];
  dashboardStats: DashboardStats;

  addCourse: (course: Partial<Course> & { title: string; category?: string; credits?: number }) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;

  addAssignment: (assignment: Partial<Assignment> & { title: string; courseId: string; totalScore: number }) => Assignment;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  getAssignmentById: (id: string) => Assignment | undefined;

  addExam: (exam: Partial<Exam> & { title: string; courseId: string; duration: number; totalScore: number; passScore: number }) => Exam;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  getExamById: (id: string) => Exam | undefined;

  addCertificate: (certificate: Partial<Certificate> & { userId: string; courseId: string; score: number }) => Certificate;
  updateCertificate: (id: string, updates: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  getCertificateById: (id: string) => Certificate | undefined;

  addApplication: (application: Partial<CourseApplication> & { status: CourseApplication['status'] }) => CourseApplication;
  updateApplication: (id: string, updates: Partial<CourseApplication>) => void;
  deleteApplication: (id: string) => void;
  getApplicationById: (id: string) => CourseApplication | undefined;

  addAssignmentSubmission: (submission: Partial<AssignmentSubmission> & { assignmentId: string; studentId: string }) => AssignmentSubmission;
  updateAssignmentSubmission: (id: string, updates: Partial<AssignmentSubmission>) => void;
  getAssignmentSubmissionsByAssignment: (assignmentId: string) => AssignmentSubmission[];

  addExamAttempt: (attempt: Partial<ExamAttempt> & { examId: string; userId: string }) => ExamAttempt;
  updateExamAttempt: (id: string, updates: Partial<ExamAttempt>) => void;
  getExamAttemptsByExam: (examId: string) => ExamAttempt[];

  addReviewRecord: (record: Omit<ReviewRecord, 'id'>) => ReviewRecord;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: mockUsers as unknown as User[],
      courses: mockCourses as unknown as Course[],
      assignments: mockAssignments,
      assignmentSubmissions: mockAssignmentSubmissions,
      exams: mockExams,
      examAttempts: mockExamAttempts,
      certificates: mockCertificates,
      applications: mockApplications,
      reviewRecords: mockReviewRecords,
      liveSessions: [],
      learningPaths: [],
      dashboardStats: mockDashboardStats,

      addCourse: (course) => {
        const now = new Date().toISOString();
        const newCourse = {
          id: generateId('c'),
          title: course.title,
          description: '',
          cover: '',
          category: course.category || '其他',
          teacherId: '',
          chapters: [],
          questions: [],
          enrolledCount: 0,
          completedCount: 0,
          rating: 0,
          status: 'draft',
          difficulty: 'beginner',
          estimatedHours: 0,
          price: 0,
          credits: course.credits || 0,
          createdAt: now,
          updatedAt: now,
          ...course,
        } as unknown as Course;
        set((state) => ({ courses: [...state.courses, newCourse] }));
        return newCourse;
      },
      updateCourse: (id, updates) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? ({ ...c, ...updates, updatedAt: new Date().toISOString() } as Course) : c,
          ),
        }));
      },
      deleteCourse: (id) => {
        set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
      },
      getCourseById: (id) => {
        return get().courses.find((c) => c.id === id);
      },

      addAssignment: (assignment) => {
        const newAssignment: Assignment = {
          id: generateId('a'),
          createdAt: new Date().toISOString(),
          ...assignment,
        };
        set((state) => ({ assignments: [...state.assignments, newAssignment] }));
        return newAssignment;
      },
      updateAssignment: (id, updates) => {
        set((state) => ({
          assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },
      deleteAssignment: (id) => {
        set((state) => ({ assignments: state.assignments.filter((a) => a.id !== id) }));
      },
      getAssignmentById: (id) => {
        return get().assignments.find((a) => a.id === id);
      },

      addExam: (exam) => {
        const newExam: Exam = {
          id: generateId('e'),
          status: 'draft',
          ...exam,
        };
        set((state) => ({ exams: [...state.exams, newExam] }));
        return newExam;
      },
      updateExam: (id, updates) => {
        set((state) => ({
          exams: state.exams.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },
      deleteExam: (id) => {
        set((state) => ({ exams: state.exams.filter((e) => e.id !== id) }));
      },
      getExamById: (id) => {
        return get().exams.find((e) => e.id === id);
      },

      addCertificate: (certificate) => {
        const newCertificate: Certificate = {
          id: generateId('cert'),
          ...certificate,
        };
        set((state) => ({ certificates: [...state.certificates, newCertificate] }));
        return newCertificate;
      },
      updateCertificate: (id, updates) => {
        set((state) => ({
          certificates: state.certificates.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },
      deleteCertificate: (id) => {
        set((state) => ({ certificates: state.certificates.filter((c) => c.id !== id) }));
      },
      getCertificateById: (id) => {
        return get().certificates.find((c) => c.id === id);
      },

      addApplication: (application) => {
        const newApplication: CourseApplication = {
          id: generateId('app'),
          submittedAt: new Date().toISOString(),
          ...application,
        };
        set((state) => ({ applications: [...state.applications, newApplication] }));
        return newApplication;
      },
      updateApplication: (id, updates) => {
        set((state) => ({
          applications: state.applications.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },
      deleteApplication: (id) => {
        set((state) => ({ applications: state.applications.filter((a) => a.id !== id) }));
      },
      getApplicationById: (id) => {
        return get().applications.find((a) => a.id === id);
      },

      addAssignmentSubmission: (submission) => {
        const gradingStatusPending: GradingStatus = 'pending';
        const defaultAnswers: AssignmentQuestionWithAnswer[] = [];
        const newSubmission: AssignmentSubmission = {
          id: generateId('sub'),
          userId: submission.studentId,
          answers: defaultAnswers,
          answerMap: {},
          attemptNumber: 1,
          submittedAt: new Date().toISOString(),
          autoScore: 0,
          assistantScore: 0,
          teacherScore: 0,
          totalScore: 0,
          maxScore: 0,
          gradingStatus: gradingStatusPending,
          isEscalated: false,
          ...submission,
        };
        set((state) => ({ assignmentSubmissions: [...state.assignmentSubmissions, newSubmission] }));
        return newSubmission;
      },
      updateAssignmentSubmission: (id, updates) => {
        set((state) => ({
          assignmentSubmissions: state.assignmentSubmissions.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        }));
      },
      getAssignmentSubmissionsByAssignment: (assignmentId) => {
        return get().assignmentSubmissions.filter((s) => s.assignmentId === assignmentId);
      },

      addExamAttempt: (attempt) => {
        const newAttempt: ExamAttempt = {
          id: generateId('att'),
          attemptNumber: 1,
          answers: {},
          objectiveScore: 0,
          screenSwitchCount: 0,
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          gradingStatus: 'pending',
          ...attempt,
        };
        set((state) => ({ examAttempts: [...state.examAttempts, newAttempt] }));
        return newAttempt;
      },
      updateExamAttempt: (id, updates) => {
        set((state) => ({
          examAttempts: state.examAttempts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },
      getExamAttemptsByExam: (examId) => {
        return get().examAttempts.filter((a) => a.examId === examId);
      },

      addReviewRecord: (record) => {
        const newRecord: ReviewRecord = {
          id: generateId('rr'),
          ...record,
        };
        set((state) => ({ reviewRecords: [...state.reviewRecords, newRecord] }));
        return newRecord;
      },
    }),
    {
      name: 'app-storage',
    },
  ),
);
