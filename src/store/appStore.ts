import { create } from 'zustand';
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
} from '@/types';
import {
  courses,
  assignments,
  exams,
  certificates,
  teachers,
  dashboard,
  users,
} from '@/services/api';

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

  fetchCourses: (params?: { subject?: string; keyword?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchAssignments: (params?: { courseId?: string; studentId?: string; status?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchExams: (params?: { courseId?: string; status?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchCertificates: (params?: { studentId?: string; status?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchApplications: (params?: { status?: string; teacherId?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchUsers: (params?: { role?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchAssignmentSubmissions: (assignmentId: string) => Promise<void>;
  fetchExamAttempts: (params?: { studentId?: string; examId?: string }) => Promise<void>;

  addCourse: (course: Partial<Course> & { title: string; category?: string; credits?: number }) => Promise<Course | null>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;
  getCourseById: (id: string) => Course | undefined;

  addAssignment: (assignment: Partial<Assignment> & { title: string; courseId: string; totalScore: number }) => Promise<Assignment | null>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<boolean>;
  deleteAssignment: (id: string) => Promise<boolean>;
  getAssignmentById: (id: string) => Assignment | undefined;

  addExam: (exam: Partial<Exam> & { title: string; courseId: string; duration: number; totalScore: number; passScore: number }) => Promise<Exam | null>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;
  getExamById: (id: string) => Exam | undefined;

  addCertificate: (certificate: Partial<Certificate> & { userId: string; courseId: string; score: number }) => Promise<Certificate | null>;
  updateCertificate: (id: string, updates: Partial<Certificate>) => Promise<boolean>;
  deleteCertificate: (id: string) => Promise<boolean>;
  getCertificateById: (id: string) => Certificate | undefined;

  addApplication: (application: Partial<CourseApplication> & { status: CourseApplication['status'] }) => Promise<CourseApplication | null>;
  updateApplication: (id: string, updates: Partial<CourseApplication>) => Promise<boolean>;
  deleteApplication: (id: string) => Promise<boolean>;
  getApplicationById: (id: string) => CourseApplication | undefined;

  addAssignmentSubmission: (submission: Partial<AssignmentSubmission> & { assignmentId: string; studentId: string }) => AssignmentSubmission;
  updateAssignmentSubmission: (id: string, updates: Partial<AssignmentSubmission>) => void;
  getAssignmentSubmissionsByAssignment: (assignmentId: string) => AssignmentSubmission[];

  addExamAttempt: (attempt: Partial<ExamAttempt> & { examId: string; userId: string }) => ExamAttempt;
  updateExamAttempt: (id: string, updates: Partial<ExamAttempt>) => void;
  getExamAttemptsByExam: (examId: string) => ExamAttempt[];

  addReviewRecord: (record: Omit<ReviewRecord, 'id'>) => ReviewRecord;
}

const defaultDashboardStats: DashboardStats = {
  totalCourses: 0,
  totalStudents: 0,
  examPassRate: 0,
  teacherStudentRatio: 0,
};

export const useAppStore = create<AppState>()(
  (set, get) => ({
    users: [],
    courses: [],
    assignments: [],
    assignmentSubmissions: [],
    exams: [],
    examAttempts: [],
    certificates: [],
    applications: [],
    reviewRecords: [],
    liveSessions: [],
    learningPaths: [],
    dashboardStats: defaultDashboardStats,

    fetchCourses: async (params) => {
      try {
        const result = await courses.getCourses(params);
        set({ courses: result.items as Course[] });
      } catch {
      }
    },

    fetchAssignments: async (params) => {
      try {
        const result = await assignments.getAssignments(params);
        set({ assignments: result.items });
      } catch {
      }
    },

    fetchExams: async (params) => {
      try {
        const result = await exams.getExams(params);
        set({ exams: result.items });
      } catch {
      }
    },

    fetchCertificates: async (params) => {
      try {
        const result = await certificates.getCertificates(params);
        set({ certificates: result.items as unknown as Certificate[] });
      } catch {
      }
    },

    fetchApplications: async (params) => {
      try {
        const result = await teachers.getApplications(params);
        set({ applications: result.items as unknown as CourseApplication[] });
      } catch {
      }
    },

    fetchDashboardStats: async () => {
      try {
        const stats = await dashboard.getDashboardStats();
        set({ dashboardStats: stats as unknown as DashboardStats });
      } catch {
      }
    },

    fetchUsers: async (params) => {
      try {
        const result = await users.getUsers(params as any);
        set({ users: result.items as unknown as User[] });
      } catch {
      }
    },

    fetchAssignmentSubmissions: async (assignmentId) => {
      try {
        const submissions = await assignments.getSubmissions(assignmentId);
        set((state) => {
          const existing = state.assignmentSubmissions.filter((s) => s.assignmentId !== assignmentId);
          return { assignmentSubmissions: [...existing, ...submissions] };
        });
      } catch {
      }
    },

    fetchExamAttempts: async (params) => {
      try {
        const attempts = await exams.getExamAttempts(params);
        set({ examAttempts: attempts });
      } catch {
      }
    },

    addCourse: async (course) => {
      try {
        const newCourse = await courses.createCourse({
          title: course.title,
          subject: course.category,
          description: course.description,
          cover: course.cover,
          credits: course.credits,
          teacherId: course.teacherId,
          status: (course.status as string) || 'draft',
        });
        set((state) => ({ courses: [...state.courses, newCourse as Course] }));
        return newCourse as Course;
      } catch {
        return null;
      }
    },
    updateCourse: async (id, updates) => {
      try {
        const updated = await courses.updateCourse(id, {
          title: updates.title,
          subject: updates.category || updates.subject,
          description: updates.description,
          cover: updates.cover,
          credits: updates.credits,
          teacherId: updates.teacherId,
          status: updates.status as string,
        });
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? ({ ...c, ...updated, updatedAt: new Date().toISOString() } as Course) : c,
          ),
        }));
        return true;
      } catch {
        return false;
      }
    },
    deleteCourse: async (id) => {
      try {
        await courses.deleteCourse(id);
        set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
        return true;
      } catch {
        return false;
      }
    },
    getCourseById: (id) => {
      return get().courses.find((c) => c.id === id);
    },

    addAssignment: async (assignment) => {
      try {
        const newAssignment = await assignments.createAssignment({
          courseId: assignment.courseId,
          title: assignment.title,
          description: assignment.description || null,
          deadline: assignment.deadline || null,
          questions: [],
        });
        set((state) => ({ assignments: [...state.assignments, newAssignment as unknown as Assignment] }));
        return newAssignment as unknown as Assignment;
      } catch {
        return null;
      }
    },
    updateAssignment: async (id, updates) => {
      try {
        const updated = await assignments.updateAssignment(id, {
          title: updates.title,
          description: updates.description || null,
          deadline: updates.deadline || null,
        });
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id ? ({ ...a, ...(updated as unknown as Assignment) } as Assignment) : a,
          ),
        }));
        return true;
      } catch {
        return false;
      }
    },
    deleteAssignment: async (id) => {
      try {
        await assignments.deleteAssignment(id);
        set((state) => ({ assignments: state.assignments.filter((a) => a.id !== id) }));
        return true;
      } catch {
        return false;
      }
    },
    getAssignmentById: (id) => {
      return get().assignments.find((a) => a.id === id);
    },

    addExam: async (exam) => {
      try {
        const newExam = await exams.createExam({
          courseId: exam.courseId,
          title: exam.title,
          duration: exam.duration,
          totalScore: exam.totalScore,
          passScore: exam.passScore,
          status: (exam.status as string) || 'draft',
        });
        set((state) => ({ exams: [...state.exams, newExam as Exam] }));
        return newExam as Exam;
      } catch {
        return null;
      }
    },
    updateExam: async (id, updates) => {
      try {
        const updated = await exams.updateExam(id, {
          title: updates.title,
          duration: updates.duration,
          totalScore: updates.totalScore,
          passScore: updates.passScore,
          startTime: updates.startTime || null,
          endTime: updates.endTime || null,
          status: (updates.status as string),
        });
        set((state) => ({
          exams: state.exams.map((e) => (e.id === id ? ({ ...e, ...(updated as Exam) } as Exam) : e)),
        }));
        return true;
      } catch {
        return false;
      }
    },
    deleteExam: async (id) => {
      try {
        await exams.deleteExam(id);
        set((state) => ({ exams: state.exams.filter((e) => e.id !== id) }));
        return true;
      } catch {
        return false;
      }
    },
    getExamById: (id) => {
      return get().exams.find((e) => e.id === id);
    },

    addCertificate: async (certificate) => {
      try {
        const newCert = await certificates.generateCertificate({
          studentId: certificate.userId,
          courseId: certificate.courseId,
          score: certificate.score,
        });
        set((state) => ({ certificates: [...state.certificates, newCert as unknown as Certificate] }));
        return newCert as unknown as Certificate;
      } catch {
        return null;
      }
    },
    updateCertificate: async (id, updates) => {
      try {
        if (updates.status === 'approved' || updates.status === 'rejected') {
          const updated = await certificates.reviewCertificate(id, {
            status: updates.status as 'approved' | 'rejected',
            remark: updates.auditRemark || updates.reviewComment,
          });
          set((state) => ({
            certificates: state.certificates.map((c) =>
              c.id === id ? ({ ...c, ...(updated as unknown as Certificate) } as Certificate) : c,
            ),
          }));
        } else {
          set((state) => ({
            certificates: state.certificates.map((c) => (c.id === id ? { ...c, ...updates } : c)),
          }));
        }
        return true;
      } catch {
        return false;
      }
    },
    deleteCertificate: async (id) => {
      set((state) => ({ certificates: state.certificates.filter((c) => c.id !== id) }));
      return true;
    },
    getCertificateById: (id) => {
      return get().certificates.find((c) => c.id === id);
    },

    addApplication: async (application) => {
      try {
        const newApp = await teachers.submitApplication({
          title: application.title || application.courseTitle || '',
          subject: application.category,
          outline: application.syllabus || application.courseOutline,
          cv: application.qualifications?.join('\n'),
        });
        set((state) => ({ applications: [...state.applications, newApp as unknown as CourseApplication] }));
        return newApp as unknown as CourseApplication;
      } catch {
        return null;
      }
    },
    updateApplication: async (id, updates) => {
      try {
        const status = updates.status as string | undefined;
        if (status === 'pending_expert' || status === 'rejected') {
          const updated = await teachers.deanReview(id, {
            status: updates.status as 'pending_expert' | 'rejected',
            remark: updates.deanReview?.comment,
          });
          set((state) => ({
            applications: state.applications.map((a) =>
              a.id === id ? ({ ...a, ...(updated as unknown as CourseApplication) } as CourseApplication) : a,
            ),
          }));
        } else if (status === 'approved') {
          const updated = await teachers.expertReview(id, {
            status: updates.status as 'approved' | 'rejected',
            remark: updates.expertReview?.comment,
          });
          set((state) => ({
            applications: state.applications.map((a) =>
              a.id === id ? ({ ...a, ...(updated as unknown as CourseApplication) } as CourseApplication) : a,
            ),
          }));
        } else {
          set((state) => ({
            applications: state.applications.map((a) => (a.id === id ? { ...a, ...updates } : a)),
          }));
        }
        return true;
      } catch {
        return false;
      }
    },
    deleteApplication: async (id) => {
      set((state) => ({ applications: state.applications.filter((a) => a.id !== id) }));
      return true;
    },
    getApplicationById: (id) => {
      return get().applications.find((a) => a.id === id);
    },

    addAssignmentSubmission: (submission) => {
      const defaultAnswers = [];
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
        gradingStatus: 'pending',
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
);
