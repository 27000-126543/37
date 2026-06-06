import { Router, type Request, type Response } from 'express';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/stats', (_req: Request, res: Response): void => {
  const totalStudents = (db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'")
    .get() as { count: number }).count;

  const totalCourses = (db
    .prepare('SELECT COUNT(*) as count FROM courses')
    .get() as { count: number }).count;

  const totalEnrolledPairs = (db
    .prepare('SELECT COUNT(DISTINCT studentId || \'-\' || courseId) as count FROM learning_behaviors WHERE courseId IS NOT NULL')
    .get() as { count: number }).count;

  const completedPairs = (db
    .prepare('SELECT COUNT(DISTINCT studentId || \'-\' || courseId) as count FROM learning_behaviors WHERE courseId IS NOT NULL AND completed = 1')
    .get() as { count: number }).count;

  const completionRate = totalEnrolledPairs > 0
    ? Math.round((completedPairs / totalEnrolledPairs) * 1000) / 10
    : 0;

  const totalExams = (db
    .prepare('SELECT COUNT(*) as count FROM exam_attempts WHERE submittedAt IS NOT NULL')
    .get() as { count: number }).count;

  const passedExams = (db
    .prepare('SELECT COUNT(*) as count FROM exam_attempts WHERE submittedAt IS NOT NULL AND passed = 1')
    .get() as { count: number }).count;

  const passRate = totalExams > 0
    ? Math.round((passedExams / totalExams) * 1000) / 10
    : 0;

  const totalTeachers = (db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role IN ('teacher', 'lecturer')")
    .get() as { count: number }).count;

  const teacherStudentRatio = totalTeachers > 0
    ? Number((totalStudents / totalTeachers).toFixed(2))
    : 0;

  res.json({
    success: true,
    data: {
      totalStudents,
      totalCourses,
      completionRate,
      passRate,
      teacherStudentRatio
    }
  });
});

router.get('/trend', (req: Request, res: Response): void => {
  const daysParam = req.query.days as string | undefined;
  const days = Math.min(90, Math.max(1, parseInt(daysParam || '7', 10)));

  const results: Array<{
    date: string;
    newUsers: number;
    newCourses: number;
    learningActivities: number;
    completedLessons: number;
  }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    const newUsers = (db
      .prepare('SELECT COUNT(*) as count FROM users WHERE DATE(createdAt) = ?')
      .get(dateStr) as { count: number }).count;

    const newCourses = (db
      .prepare('SELECT COUNT(*) as count FROM courses WHERE DATE(createdAt) = ?')
      .get(dateStr) as { count: number }).count;

    const learningActivities = (db
      .prepare('SELECT COUNT(*) as count FROM learning_behaviors WHERE DATE(createdAt) = ?')
      .get(dateStr) as { count: number }).count;

    const completedLessons = (db
      .prepare('SELECT COUNT(*) as count FROM learning_behaviors WHERE DATE(createdAt) = ? AND completed = 1')
      .get(dateStr) as { count: number }).count;

    results.push({
      date: dateStr,
      newUsers,
      newCourses,
      learningActivities,
      completedLessons
    });
  }

  res.json({
    success: true,
    data: results
  });
});

router.get('/subject-distribution', (_req: Request, res: Response): void => {
  const rows = db.prepare(`
    SELECT
      COALESCE(subject, '未分类') as subject,
      COUNT(*) as courseCount
    FROM courses
    GROUP BY subject
    ORDER BY courseCount DESC
  `).all() as Array<{ subject: string; courseCount: number }>;

  const total = rows.reduce((sum, r) => sum + r.courseCount, 0);
  const data = rows.map(r => ({
    ...r,
    percentage: total > 0 ? Math.round((r.courseCount / total) * 1000) / 10 : 0
  }));

  res.json({
    success: true,
    data
  });
});

router.get('/monthly-exam-pass', (_req: Request, res: Response): void => {
  const results: Array<{ month: string; total: number; passed: number; passRate: number }> = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    const total = (db
      .prepare(
        "SELECT COUNT(*) as count FROM exam_attempts WHERE submittedAt IS NOT NULL AND strftime('%Y-%m', submittedAt) = ?"
      )
      .get(monthStr) as { count: number }).count;

    const passed = (db
      .prepare(
        "SELECT COUNT(*) as count FROM exam_attempts WHERE submittedAt IS NOT NULL AND passed = 1 AND strftime('%Y-%m', submittedAt) = ?"
      )
      .get(monthStr) as { count: number }).count;

    results.push({
      month: monthStr,
      total,
      passed,
      passRate: total > 0 ? Math.round((passed / total) * 1000) / 10 : 0
    });
  }

  res.json({
    success: true,
    data: results
  });
});

export default router;
