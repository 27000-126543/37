import { Router, type Request, type Response } from 'express';
import { db } from '@/db/index.js';
import { authenticateToken } from '@/middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/stats', (_req: Request, res: Response): void => {
  const totalStudents = (db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'")
    .get() as { count: number }).count;

  const totalCourses = (db
    .prepare('SELECT COUNT(*) as count FROM courses')
    .get() as { count: number }).count;

  const totalEnrollments = (db
    .prepare('SELECT COUNT(*) as count FROM enrollments')
    .get() as { count: number }).count;

  const completedEnrollments = (db
    .prepare("SELECT COUNT(*) as count FROM enrollments WHERE status = 'completed'")
    .get() as { count: number }).count;

  const completionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 1000) / 10
    : 0;

  const totalExams = (db
    .prepare('SELECT COUNT(*) as count FROM exam_attempts WHERE status = ?')
    .get('submitted') as { count: number }).count;

  const passedExams = (db
    .prepare('SELECT COUNT(*) as count FROM exam_attempts WHERE status = ? AND isPassed = 1')
    .get('submitted') as { count: number }).count;

  const passRate = totalExams > 0
    ? Math.round((passedExams / totalExams) * 1000) / 10
    : 0;

  const totalTeachers = (db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role IN ('teacher', 'lecturer')")
    .get() as { count: number }).count;

  const teacherStudentRatio = totalTeachers > 0
    ? totalStudents / totalTeachers
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

  const results: Array<{ date: string; enrollments: number; completions: number; newUsers: number }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    const enrollments = (db
      .prepare('SELECT COUNT(*) as count FROM enrollments WHERE DATE(enrolledAt) = ?')
      .get(dateStr) as { count: number }).count;

    const completions = (db
      .prepare("SELECT COUNT(*) as count FROM enrollments WHERE status = 'completed' AND DATE(completedAt) = ?")
      .get(dateStr) as { count: number }).count;

    const newUsers = (db
      .prepare('SELECT COUNT(*) as count FROM users WHERE DATE(createdAt) = ?')
      .get(dateStr) as { count: number }).count;

    results.push({
      date: dateStr,
      enrollments,
      completions,
      newUsers
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
      COUNT(*) as courseCount,
      COALESCE(SUM(enrolledCount), 0) as studentCount
    FROM courses
    GROUP BY subject
    ORDER BY courseCount DESC
  `).all() as Array<{ subject: string; courseCount: number; studentCount: number }>;

  res.json({
    success: true,
    data: rows
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
        "SELECT COUNT(*) as count FROM exam_attempts WHERE status = 'submitted' AND strftime('%Y-%m', submittedAt) = ?"
      )
      .get(monthStr) as { count: number }).count;

    const passed = (db
      .prepare(
        "SELECT COUNT(*) as count FROM exam_attempts WHERE status = 'submitted' AND isPassed = 1 AND strftime('%Y-%m', submittedAt) = ?"
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
