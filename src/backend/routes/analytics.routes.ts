import { Router, type Request, type Response } from 'express';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/permission.js';
import { success, error } from '../utils/response.js';

const router = Router();

interface SixDimensionScores {
  programming: number;
  theory: number;
  practice: number;
  expression: number;
  collaboration: number;
  innovation: number;
}

interface WeeklyDuration {
  date: string;
  watchDuration: number;
}

interface WeaknessItem {
  knowledgePoint: string;
  scoreRate: number;
  relatedCourses: Array<{
    id: string;
    title: string;
    subject: string | null;
  }>;
}

interface TimelineEvent {
  id: string;
  type: 'learning' | 'submission' | 'attempt';
  title: string;
  description: string;
  courseId: string | null;
  courseTitle: string | null;
  createdAt: string;
  details: Record<string, unknown>;
}

const clampScore = (score: number): number => Math.max(0, Math.min(100, Math.round(score)));

const calculateSixDimensions = (studentId: string): SixDimensionScores => {
  const examAttempts = db.prepare(`
    SELECT ea.score, e.totalScore, e.passScore, e.courseId
    FROM exam_attempts ea
    JOIN exams e ON ea.examId = e.id
    WHERE ea.studentId = ? AND ea.submittedAt IS NOT NULL
    ORDER BY ea.submittedAt DESC
  `).all(studentId) as Array<{
    score: number;
    totalScore: number;
    passScore: number;
    courseId: string;
  }>;

  const assignmentSubmissions = db.prepare(`
    SELECT asub.totalScore, a.courseId
    FROM assignment_submissions asub
    JOIN assignments a ON asub.assignmentId = a.id
    WHERE asub.studentId = ? AND asub.status IN ('graded', 'teacher_graded', 'assistant_graded', 'auto_graded')
    ORDER BY asub.submittedAt DESC
  `).all(studentId) as Array<{
    totalScore: number;
    courseId: string;
  }>;

  const learningBehaviors = db.prepare(`
    SELECT watchDuration, completed, courseId
    FROM learning_behaviors
    WHERE studentId = ?
  `).all(studentId) as Array<{
    watchDuration: number;
    completed: number;
    courseId: string | null;
  }>;

  const avgExamScore = examAttempts.length > 0
    ? examAttempts.reduce((sum, e) => sum + (e.totalScore > 0 ? (e.score / e.totalScore) * 100 : 0), 0) / examAttempts.length
    : 50;

  const avgAssignmentScore = assignmentSubmissions.length > 0
    ? assignmentSubmissions.reduce((sum, a) => sum + Math.min(a.totalScore, 100), 0) / assignmentSubmissions.length
    : 50;

  const totalWatchDuration = learningBehaviors.reduce((sum, b) => sum + b.watchDuration, 0);
  const completedCount = learningBehaviors.filter(b => b.completed === 1).length;
  const completionRate = learningBehaviors.length > 0 ? (completedCount / learningBehaviors.length) * 100 : 0;

  const programming = clampScore(
    avgExamScore * 0.4 + avgAssignmentScore * 0.4 + Math.min(totalWatchDuration / 600, 100) * 0.2
  );

  const theory = clampScore(
    avgExamScore * 0.6 + completionRate * 0.2 + avgAssignmentScore * 0.2
  );

  const practice = clampScore(
    avgAssignmentScore * 0.5 + completionRate * 0.3 + Math.min(totalWatchDuration / 600, 100) * 0.2
  );

  const expression = clampScore(
    avgAssignmentScore * 0.4 + completionRate * 0.3 + avgExamScore * 0.3
  );

  const uniqueCourses = new Set(learningBehaviors.filter(b => b.courseId).map(b => b.courseId)).size;
  const collaboration = clampScore(
    completionRate * 0.4 + Math.min(uniqueCourses * 15, 100) * 0.3 + avgAssignmentScore * 0.3
  );

  const highScoreCount = examAttempts.filter(e => e.totalScore > 0 && (e.score / e.totalScore) >= 0.85).length;
  const innovation = clampScore(
    Math.min(highScoreCount * 20, 100) * 0.4 + avgExamScore * 0.3 + avgAssignmentScore * 0.3
  );

  return { programming, theory, practice, expression, collaboration, innovation };
};

router.use(authenticateToken);

router.get('/student/:studentId', requireRole('admin', 'dean', 'teacher', 'assistant', 'student'), (req: Request, res: Response): void => {
  const { studentId } = req.params as { studentId: string };

  if (req.user?.role === 'student' && req.user.id !== studentId) {
    res.status(403).json(error('权限不足，只能查看自己的数据分析', 403));
    return;
  }

  interface DbStudent {
    id: string;
    realName: string | null;
    username: string;
    role: string;
  }

  const student = db.prepare('SELECT id, realName, username, role FROM users WHERE id = ? AND role = ?').get(studentId, 'student') as DbStudent | undefined;
  if (!student) {
    res.status(404).json(error('学生不存在', 404));
    return;
  }

  const dimensions = calculateSixDimensions(studentId);

  const dimensionLabels: Record<keyof SixDimensionScores, string> = {
    programming: '编程能力',
    theory: '理论基础',
    practice: '实践能力',
    expression: '表达能力',
    collaboration: '协作能力',
    innovation: '创新能力'
  };

  const result = {
    student: {
      id: student.id,
      name: student.realName || student.username
    },
    dimensions: (Object.keys(dimensions) as Array<keyof SixDimensionScores>).map(key => ({
      key,
      label: dimensionLabels[key],
      score: dimensions[key]
    })),
    rawScores: dimensions,
    overallScore: clampScore(
      Object.values(dimensions).reduce((sum, v) => sum + v, 0) / Object.keys(dimensions).length
    ),
    generatedAt: new Date().toISOString()
  };

  res.json(success(result));
});

router.get('/student/:studentId/weekly', requireRole('admin', 'dean', 'teacher', 'assistant', 'student'), (req: Request, res: Response): void => {
  const { studentId } = req.params as { studentId: string };
  const { weeks = '4' } = req.query as { weeks?: string };

  if (req.user?.role === 'student' && req.user.id !== studentId) {
    res.status(403).json(error('权限不足，只能查看自己的学习数据', 403));
    return;
  }

  const weekNum = Math.max(1, Math.min(52, parseInt(weeks, 10)));
  const days = weekNum * 7;

  const student = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(studentId, 'student');
  if (!student) {
    res.status(404).json(error('学生不存在', 404));
    return;
  }

  const dailyData: Record<string, number> = {};

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    dailyData[dateStr] = 0;
  }

  const rows = db.prepare(`
    SELECT DATE(createdAt) as date, SUM(watchDuration) as totalDuration
    FROM learning_behaviors
    WHERE studentId = ? AND createdAt >= ?
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `).all(
    studentId,
    new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString()
  ) as Array<{ date: string; totalDuration: number }>;

  for (const row of rows) {
    if (dailyData[row.date] !== undefined) {
      dailyData[row.date] = row.totalDuration;
    }
  }

  const result: WeeklyDuration[] = Object.entries(dailyData).map(([date, watchDuration]) => ({
    date,
    watchDuration
  }));

  const totalDuration = result.reduce((sum, d) => sum + d.watchDuration, 0);
  const averageDaily = Math.round(totalDuration / days);
  const activeDays = result.filter(d => d.watchDuration > 0).length;

  res.json(success({
    days: result,
    weeks: weekNum,
    summary: {
      totalDuration,
      averageDaily,
      activeDays,
      totalDays: days
    }
  }));
});

router.get('/student/:studentId/weaknesses', requireRole('admin', 'dean', 'teacher', 'assistant', 'student'), (req: Request, res: Response): void => {
  const { studentId } = req.params as { studentId: string };

  if (req.user?.role === 'student' && req.user.id !== studentId) {
    res.status(403).json(error('权限不足，只能查看自己的学习数据', 403));
    return;
  }

  const student = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(studentId, 'student');
  if (!student) {
    res.status(404).json(error('学生不存在', 404));
    return;
  }

  const weaknesses: WeaknessItem[] = [];

  const examAttempts = db.prepare(`
    SELECT ea.score, e.totalScore, e.courseId, e.title as examTitle, co.title as courseTitle, co.subject
    FROM exam_attempts ea
    JOIN exams e ON ea.examId = e.id
    LEFT JOIN courses co ON e.courseId = co.id
    WHERE ea.studentId = ? AND ea.submittedAt IS NOT NULL AND e.totalScore > 0
    ORDER BY ea.submittedAt DESC
  `).all(studentId) as Array<{
    score: number;
    totalScore: number;
    courseId: string;
    examTitle: string;
    courseTitle: string;
    subject: string | null;
  }>;

  const assignmentSubmissions = db.prepare(`
    SELECT asub.totalScore, a.courseId, a.title as assignmentTitle, co.title as courseTitle, co.subject
    FROM assignment_submissions asub
    JOIN assignments a ON asub.assignmentId = a.id
    LEFT JOIN courses co ON a.courseId = co.id
    WHERE asub.studentId = ? AND asub.status IN ('graded', 'teacher_graded', 'assistant_graded', 'auto_graded')
    ORDER BY asub.submittedAt DESC
  `).all(studentId) as Array<{
    totalScore: number;
    courseId: string;
    assignmentTitle: string;
    courseTitle: string;
    subject: string | null;
  }>;

  const courseScores: Record<string, { examScores: number[]; assignmentScores: number[]; courseTitle: string; subject: string | null }> = {};

  for (const exam of examAttempts) {
    if (!courseScores[exam.courseId]) {
      courseScores[exam.courseId] = { examScores: [], assignmentScores: [], courseTitle: exam.courseTitle, subject: exam.subject };
    }
    courseScores[exam.courseId].examScores.push((exam.score / exam.totalScore) * 100);
  }

  for (const submission of assignmentSubmissions) {
    if (!courseScores[submission.courseId]) {
      courseScores[submission.courseId] = { examScores: [], assignmentScores: [], courseTitle: submission.courseTitle, subject: submission.subject };
    }
    courseScores[submission.courseId].assignmentScores.push(Math.min(submission.totalScore, 100));
  }

  for (const [courseId, data] of Object.entries(courseScores)) {
    const allScores = [...data.examScores, ...data.assignmentScores];
    if (allScores.length === 0) continue;

    const avgScore = allScores.reduce((sum, s) => sum + s, 0) / allScores.length;

    if (avgScore < 60) {
      const relatedCourses = db.prepare(`
        SELECT id, title, subject
        FROM courses
        WHERE (subject = ? OR subject IS NULL) AND id != ? AND status = 'published'
        ORDER BY createdAt DESC
        LIMIT 3
      `).all(data.subject, courseId) as Array<{ id: string; title: string; subject: string | null }>;

      weaknesses.push({
        knowledgePoint: data.courseTitle || courseId,
        scoreRate: Math.round(avgScore * 10) / 10,
        relatedCourses
      });
    }
  }

  weaknesses.sort((a, b) => a.scoreRate - b.scoreRate);

  res.json(success({
    weaknesses,
    totalWeaknesses: weaknesses.length,
    generatedAt: new Date().toISOString()
  }));
});

router.get('/student/:studentId/timeline', requireRole('admin', 'dean', 'teacher', 'assistant', 'student'), (req: Request, res: Response): void => {
  const { studentId } = req.params as { studentId: string };

  if (req.user?.role === 'student' && req.user.id !== studentId) {
    res.status(403).json(error('权限不足，只能查看自己的学习数据', 403));
    return;
  }

  const student = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(studentId, 'student');
  if (!student) {
    res.status(404).json(error('学生不存在', 404));
    return;
  }

  const events: TimelineEvent[] = [];

  const behaviors = db.prepare(`
    SELECT lb.id, lb.watchDuration, lb.completed, lb.createdAt, lb.courseId, c.title as courseTitle
    FROM learning_behaviors lb
    LEFT JOIN courses c ON lb.courseId = c.id
    WHERE lb.studentId = ?
    ORDER BY lb.createdAt DESC
    LIMIT 30
  `).all(studentId) as Array<{
    id: string;
    watchDuration: number;
    completed: number;
    createdAt: string;
    courseId: string | null;
    courseTitle: string | null;
  }>;

  for (const b of behaviors) {
    events.push({
      id: `lb-${b.id}`,
      type: 'learning',
      title: b.completed ? '完成课程学习' : '学习课程',
      description: `学习时长 ${b.watchDuration} 分钟${b.courseTitle ? ` - ${b.courseTitle}` : ''}`,
      courseId: b.courseId,
      courseTitle: b.courseTitle,
      createdAt: b.createdAt,
      details: { watchDuration: b.watchDuration, completed: b.completed === 1 }
    });
  }

  const submissions = db.prepare(`
    SELECT asub.id, asub.totalScore, asub.submittedAt, asub.status, a.title as assignmentTitle, a.courseId, c.title as courseTitle
    FROM assignment_submissions asub
    JOIN assignments a ON asub.assignmentId = a.id
    LEFT JOIN courses c ON a.courseId = c.id
    WHERE asub.studentId = ?
    ORDER BY asub.submittedAt DESC
    LIMIT 30
  `).all(studentId) as Array<{
    id: string;
    totalScore: number;
    submittedAt: string;
    status: string;
    assignmentTitle: string;
    courseId: string;
    courseTitle: string | null;
  }>;

  for (const s of submissions) {
    events.push({
      id: `as-${s.id}`,
      type: 'submission',
      title: '提交作业',
      description: `${s.assignmentTitle} - 得分 ${s.totalScore}${s.courseTitle ? ` (${s.courseTitle})` : ''}`,
      courseId: s.courseId,
      courseTitle: s.courseTitle,
      createdAt: s.submittedAt,
      details: { score: s.totalScore, status: s.status, assignmentTitle: s.assignmentTitle }
    });
  }

  const attempts = db.prepare(`
    SELECT ea.id, ea.score, ea.startedAt, ea.submittedAt, ea.passed, e.title as examTitle, e.courseId, c.title as courseTitle, e.totalScore
    FROM exam_attempts ea
    JOIN exams e ON ea.examId = e.id
    LEFT JOIN courses c ON e.courseId = c.id
    WHERE ea.studentId = ?
    ORDER BY COALESCE(ea.submittedAt, ea.startedAt) DESC
    LIMIT 30
  `).all(studentId) as Array<{
    id: string;
    score: number;
    startedAt: string;
    submittedAt: string | null;
    passed: number;
    examTitle: string;
    courseId: string;
    courseTitle: string | null;
    totalScore: number;
  }>;

  for (const a of attempts) {
    const scoreRate = a.totalScore > 0 ? Math.round((a.score / a.totalScore) * 100) : 0;
    events.push({
      id: `ea-${a.id}`,
      type: 'attempt',
      title: a.submittedAt ? '完成考试' : '参加考试',
      description: `${a.examTitle}${a.submittedAt ? ` - 得分 ${a.score}/${a.totalScore} (${scoreRate}%) ${a.passed ? '✓ 通过' : '✗ 未通过'}` : ' 进行中'}${a.courseTitle ? ` (${a.courseTitle})` : ''}`,
      courseId: a.courseId,
      courseTitle: a.courseTitle,
      createdAt: a.submittedAt || a.startedAt,
      details: {
        score: a.score,
        totalScore: a.totalScore,
        scoreRate,
        passed: a.passed === 1,
        examTitle: a.examTitle,
        submitted: !!a.submittedAt
      }
    });
  }

  events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const result = events.slice(0, 30);

  res.json(success({
    events: result,
    total: result.length,
    types: {
      learning: result.filter(e => e.type === 'learning').length,
      submission: result.filter(e => e.type === 'submission').length,
      attempt: result.filter(e => e.type === 'attempt').length
    }
  }));
});

export default router;
