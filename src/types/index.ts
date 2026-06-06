/**
 * 用户角色枚举
 * admin: 管理员 - 全局管理、系统配置、所有数据查看、用户权限分配
 * dean: 教务 - 教学统计数据查看、讲师课程审核、班级管理、证书审核
 * teacher: 讲师 - 开设课程申请、课程内容管理、直播授课、主观题终审、成绩管理
 * assistant: 助教 - 分配班级学员管理、主观题评分、学员答疑
 * student: 学员 - 课程学习、作业提交、在线考试、证书查看、个人学习数据
 * academic: 教务(别名)
 * lecturer: 讲师(别名)
 * guest: 访客 - 只读访问公开内容
 */
export type UserRole = 'admin' | 'dean' | 'teacher' | 'assistant' | 'student' | 'academic' | 'lecturer' | 'guest';

/**
 * 题目类型枚举
 * 单选题/多选题/判断题/主观题/填空题/简答题/论述题/布尔题
 */
export type QuestionType = 'single' | 'multiple' | 'judge' | 'fill' | 'short' | 'essay' | 'boolean' | 'subjective';

/**
 * 课程状态枚举
 */
export type CourseStatus = 'draft' | 'published' | 'archived' | 'online' | 'pending' | 'reviewing';

/**
 * 课件类型枚举
 */
export type CoursewareType = 'video' | 'pdf' | 'ppt' | 'doc';

/**
 * 作业状态枚举
 */
export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'grading' | 'graded' | 'overdue';

/**
 * 批改状态枚举
 */
export type GradingStatus = 'pending' | 'assistant_graded' | 'teacher_graded' | 'auto_graded' | 'needs_review';

/**
 * 权限操作类型
 */
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'manage'
  | 'review'
  | 'approve';

/**
 * 资源类型
 */
export type ResourceType =
  | 'user'
  | 'course'
  | 'lesson'
  | 'quiz'
  | 'report'
  | 'danmaku'
  | 'comment'
  | 'announcement'
  | 'setting';

/**
 * 权限定义
 */
export interface Permission {
  action: PermissionAction;
  resource: ResourceType;
  condition?: (userId: string, targetId?: string) => boolean;
}

/**
 * 用户基础信息
 */
export interface User {
  id: string;
  username: string;
  name?: string;
  realName?: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  department?: string;
  title?: string;
  registeredAt?: string;
  createdAt?: string;
  lastLoginAt?: string;
  status?: 'active' | 'inactive' | 'disabled';
  profile?: {
    gender?: 'male' | 'female';
    birthDate?: string;
    bio?: string;
    skills?: string[];
    experienceYears?: number;
  };
  assignedClasses?: string[];
  password?: string;
  permissions?: Permission[];
}

/**
 * 题目选项
 */
export interface QuestionOption {
  key?: string;
  content: string;
}

/**
 * 题目信息
 */
export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[] | QuestionOption[];
  answer: string | string[];
  correctAnswer?: string | string[] | boolean;
  score: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  knowledgePoint?: string;
  knowledgePoints?: string[];
  courseId?: string;
  chapterId?: string;
  analysis?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 用户答案
 */
export interface UserAnswer {
  questionId: string;
  answer: string | string[] | boolean | null;
}

/**
 * 单题批改结果
 */
export interface GradingResult {
  questionId: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  correctAnswer: string | string[] | boolean | undefined;
  userAnswer: string | string[] | boolean | null;
}

/**
 * 批改汇总结果
 */
export interface GradingSummary {
  totalScore: number;
  maxScore: number;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  results: GradingResult[];
}

/**
 * 课件/学习材料
 */
export interface Courseware {
  id: string;
  name?: string;
  title?: string;
  type: CoursewareType | 'video' | 'pdf' | 'ppt' | 'doc' | 'audio' | 'image' | 'document';
  url: string;
  fileUrl?: string;
  fileSize?: string | number;
  size?: number;
  duration?: number;
  uploadedAt?: string;
  uploadedBy?: string;
  chapterId?: string;
  lessonId?: string;
  downloadable?: boolean;
}

/**
 * 学习材料/课件(别名)
 */
export type Material = Courseware;

/**
 * 课时信息
 */
export interface Lesson {
  id: string;
  title: string;
  duration: number;
  description?: string;
  coursewares?: Courseware[];
  materials?: Material[];
  type?: string;
  resourceUrl?: string;
  liveSessionId?: string;
  isFree?: boolean;
  sortOrder?: number;
  order?: number;
  chapterId?: string;
  createdAt?: string;
}

/**
 * 课程章节
 */
export interface Chapter {
  id: string;
  title: string;
  description?: string;
  order?: number;
  sortOrder?: number;
  duration?: number;
  lessons: Lesson[];
  courseId?: string;
  isFree?: boolean;
  createdAt?: string;
}

/**
 * 课程信息
 */
export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  cover: string;
  description: string;
  category?: string;
  subject?: string;
  tags?: string[];
  teacherId?: string;
  lecturerId?: string;
  lecturer?: User;
  assistantIds?: string[];
  chapters: Chapter[];
  questions?: Question[];
  materials?: Courseware[];
  enrolledCount?: number;
  completedCount?: number;
  studentCount?: number;
  enrollmentCount?: number;
  completionRate?: number;
  rating?: number;
  status: CourseStatus;
  difficulty?: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  estimatedHours?: number;
  totalDuration?: number;
  duration?: number;
  price?: number;
  credits?: number;
  prerequisites?: string[];
  maxStudents?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 作业题目(内部引用)
 */
export interface AssignmentQuestionInternal {
  questionId: string;
  order?: number;
}

/**
 * 作业题目(含用户答案)
 */
export interface AssignmentQuestionWithAnswer {
  questionId: string;
  type?: 'single' | 'multiple' | 'judge' | 'subjective';
  content?: string;
  score: number;
  studentAnswer?: string | string[];
  isCorrect?: boolean;
  studentScore?: number;
  gradingComment?: string;
  gradedBy?: string;
  gradedAt?: string;
  gradingStatus?: GradingStatus;
}

/**
 * 作业题目关联
 */
export interface AssignmentQuestion {
  id?: string;
  assignmentId?: string;
  questionId: string;
  question?: Question;
  order?: number;
  score?: number;
  type?: 'single' | 'multiple' | 'judge' | 'subjective';
  content?: string;
  studentAnswer?: string | string[];
  isCorrect?: boolean;
  studentScore?: number;
  gradingComment?: string;
  gradedBy?: string;
  gradedAt?: string;
  gradingStatus?: GradingStatus;
}

/**
 * 作业提交记录
 */
export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  userId?: string;
  user?: User;
  answers: AssignmentQuestionWithAnswer[];
  answerMap?: Record<string, string | string[]>;
  attemptNumber?: number;
  submittedAt: string;
  autoScore: number;
  assistantScore: number;
  teacherScore: number;
  objectiveScore?: number;
  subjectiveScore?: number;
  totalScore: number;
  maxScore: number;
  gradingStatus: GradingStatus;
  gradingStatusValue?: 'pending' | 'grading' | 'graded';
  gradingAssignee?: string;
  graderId?: string;
  gradedAt?: string;
  feedback?: string;
  isEscalated: boolean;
  isPassed?: boolean;
  escalationReason?: string;
  isOverdue?: boolean;
}

/**
 * 作业
 */
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  chapterId?: string;
  questions?: AssignmentQuestionInternal[];
  questionIds?: string[];
  deadline?: string;
  deadlineAt?: string;
  startAt?: string;
  publishedAt?: string;
  totalScore: number;
  passScore?: number;
  passingScore?: number;
  allowLateSubmit?: boolean;
  latePenaltyRate?: number;
  allowedAttempts?: number;
  status?: AssignmentStatus;
  statusValue?: 'draft' | 'published' | 'closed';
  createdBy?: string;
  createdAt: string;
  submissions?: AssignmentSubmission[];
}

/**
 * 考试
 */
export interface Exam {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  duration: number;
  totalScore: number;
  passScore: number;
  passingScore?: number;
  credits?: number;
  questionCount?: number;
  questionIds?: string[];
  startTime?: string;
  endTime?: string;
  allowRetake?: boolean;
  maxRetakes?: number;
  enableAntiCheat?: boolean;
  maxScreenSwitches?: number;
  status?: 'draft' | 'not_started' | 'in_progress' | 'ended' | 'published';
  createdAt?: string;
}

/**
 * 考试作答记录
 */
export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  user?: User;
  attemptNumber: number;
  answers: Record<string, string | string[]>;
  objectiveScore: number;
  subjectiveScore?: number;
  totalScore?: number;
  isPassed?: boolean;
  screenSwitchCount: number;
  hasCheatingSuspicion?: boolean;
  status: 'in_progress' | 'submitted' | 'timeout';
  startedAt: string;
  submittedAt?: string;
  gradingStatus: 'pending' | 'graded';
  gradedAt?: string;
}

/**
 * 证书
 */
export interface Certificate {
  id: string;
  userId: string;
  user?: User;
  courseId: string;
  examId?: string;
  score: number;
  credits?: number;
  certificateNo?: string;
  type?: 'completion' | 'honor' | 'qualification';
  title?: string;
  description?: string;
  issuedAt?: string;
  auditStatus?: 'pending' | 'approved' | 'rejected';
  status?: 'valid' | 'revoked' | 'pending' | 'approved' | 'rejected';
  auditorId?: string;
  reviewedBy?: string;
  auditedAt?: string;
  reviewedAt?: string;
  auditRemark?: string;
  reviewComment?: string;
  fileUrl?: string;
  lecturerId?: string;
  lecturer?: User;
}

/**
 * 直播会话
 */
export interface LiveSession {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  lecturerId: string;
  lecturer?: User;
  scheduledStartAt: string;
  scheduledEndAt: string;
  actualStartAt?: string;
  actualEndAt?: string;
  status: 'not_started' | 'live' | 'ended';
  streamUrl?: string;
  peakViewers: number;
  totalViewers: number;
  replayUrl?: string;
  createdAt: string;
}

/**
 * 弹幕消息(基础类型)
 */
export interface DanmakuMessage {
  id?: string;
  liveSessionId?: string;
  userId: string;
  content: string;
  timestamp: number;
  color?: string;
  fontSize?: 'small' | 'medium' | 'large';
  position?: 'top' | 'scroll' | 'bottom';
}

/**
 * 弹幕过滤结果
 */
export interface FilterResult {
  isSafe: boolean;
  originalContent: string;
  filteredContent: string;
  matchedWords: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * 弹幕消息(完整记录)
 */
export interface Danmaku {
  id: string;
  liveSessionId: string;
  userId: string;
  user?: User;
  content: string;
  timestamp: number;
  color?: string;
  auditStatus: 'pending' | 'approved' | 'blocked';
  hasSensitiveWords?: boolean;
  createdAt: string;
}

/**
 * 学习路径步骤
 */
export interface PathStep {
  id: string;
  learningPathId: string;
  order: number;
  title: string;
  type: 'course' | 'assignment' | 'exam' | 'practice';
  resourceId: string;
  prerequisiteStepIds?: string[];
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

/**
 * 学习路径
 */
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  userId: string;
  courseIds: string[];
  steps?: PathStep[];
  estimatedHours: number;
  status: 'in_progress' | 'completed' | 'paused';
  progress: number;
  createdAt: string;
  estimatedFinishAt?: string;
  finishedAt?: string;
}

/**
 * 学习数据(用于推荐系统)
 */
export interface LearningData {
  userId: string;
  completedCourses: string[];
  courseProgress: Record<string, number>;
  quizScores: Record<string, number>;
  studyTimePerSubject: Record<string, number>;
  weakPoints: string[];
  strongPoints: string[];
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
}

/**
 * 推荐学习路径项
 */
export interface RecommendedPath {
  courseId: string;
  courseTitle: string;
  priority: number;
  reason: string;
  estimatedTime: number;
}

/**
 * 学习行为记录
 */
export interface LearningBehavior {
  id: string;
  userId: string;
  courseId?: string;
  chapterId?: string;
  lessonId?: string;
  resourceId?: string;
  type?: 'watch_video' | 'complete_lesson' | 'submit_assignment' | 'take_exam' | 'login' | 'browse_material';
  actionType?: 'view' | 'play' | 'pause' | 'complete' | 'comment' | 'download' | 'search';
  resourceType?: 'video' | 'pdf' | 'ppt' | 'assignment' | 'exam' | 'live' | 'lesson' | 'course';
  metadata?: Record<string, unknown>;
  duration?: number;
  progress?: number;
  occurredAt?: string;
  timestamp?: string;
  ipAddress?: string;
  device?: string;
}

/**
 * 能力维度
 */
export interface AbilityDimension {
  id?: string;
  name?: string;
  dimension?: string;
  description?: string;
  score: number;
  maxScore?: number;
  rankPercent?: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  classAverage?: number;
  weight?: number;
  subDimensions?: AbilityDimension[] | { name?: string; dimension?: string; score: number }[];
}

/**
 * 能力画像
 */
export interface AbilityProfile {
  id?: string;
  userId: string;
  user?: User;
  courseId?: string;
  dimensions: AbilityDimension[];
  overallScore: number;
  weakPoints?: string[];
  strongPoints?: string[];
  suggestions?: string[];
  generatedAt?: string;
  updatedAt?: string;
  updateTime?: string;
}

/**
 * 教务审核信息
 */
export interface DeanReview {
  reviewerId: string;
  reviewerName?: string;
  decision: 'approved' | 'rejected' | 'pending';
  comment?: string;
  reviewedAt: string;
}

/**
 * 专家评审信息
 */
export interface ExpertReview {
  reviewerId: string;
  reviewerName?: string;
  decision: 'approved' | 'rejected' | 'pending';
  comment?: string;
  reviewedAt: string;
}

/**
 * 讲师开课申请
 */
export interface CourseApplication {
  id: string;
  lecturerId?: string;
  applicantId?: string;
  lecturer?: User;
  courseTitle?: string;
  title?: string;
  courseDescription?: string;
  description?: string;
  courseOutline?: string;
  syllabus?: string;
  category?: string;
  estimatedHours?: number;
  credits?: number;
  credentials?: string[];
  qualifications?: string[];
  cover?: string;
  status:
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
    | 'cancelled';
  submittedAt: string;
  expiresAt?: string;
  deanReview?: DeanReview;
  expertReview?: ExpertReview;
  reviewRecords?: ReviewRecord[];
  generatedCourseId?: string;
}

/**
 * 审核记录
 */
export interface ReviewRecord {
  id: string;
  applicationId: string;
  reviewType: 'first' | 'final';
  reviewerId: string;
  reviewer?: User;
  result: 'approved' | 'rejected';
  remark?: string;
  reviewedAt: string;
  isOverdue: boolean;
}

/**
 * 学科分布数据
 */
export interface SubjectBreakdownItem {
  subject: string;
  count: number;
}

/**
 * 每日趋势数据
 */
export interface DailyTrendItem {
  date: string;
  enrollments?: number;
  completions?: number;
  count?: number;
}

/**
 * 数据大屏统计数据
 */
export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalLecturers?: number;
  totalTeachers?: number;
  totalAssistants?: number;
  todayActiveUsers?: number;
  activeUsersToday?: number;
  activeCourses?: number;
  todayEnrollments?: number;
  totalEnrollments?: number;
  totalUsers?: number;
  courseCompletionRate?: number;
  completionRate?: number;
  examPassRate: number;
  averageStudyHours?: number;
  teacherCount?: number;
  teacherStudentRatio: string | number;
  liveCourses?: number;
  todayAssignmentSubmissions?: number;
  pendingApplications?: number;
  pendingGradingAssignments?: number;
  subjectBreakdown?: SubjectBreakdownItem[];
  monthlyTrend?: { month: string; activeUsers: number; newEnrollments: number }[];
  categoryDistribution?: { category: string; count: number; percentage: number }[];
  subjectEnrollmentTrend?: {
    subject: string;
    data: {
      date: string;
      count: number;
    }[];
  }[];
  dailyTrend?: DailyTrendItem[];
  weeklyActiveTrend?: {
    date: string;
    count: number;
  }[];
  subjectDistribution?: {
    subject: string;
    courseCount: number;
    studentCount: number;
  }[];
}

/**
 * 报表行数据
 */
export interface ReportRow {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * 导出选项
 */
export interface ExportOptions {
  filename?: string;
  delimiter?: string;
  includeHeader?: boolean;
  encoding?: string;
  columns?: string[];
}
