import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/permission.js';
import { success, error } from '../utils/response.js';
import type { Certificate, CertificateStatus, PaginatedResult } from '../types/index.js';

const router = Router();

interface DbCertificate {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  issuedAt: string | null;
  status: string;
  reviewedAt: string | null;
  reviewerId: string | null;
  remark: string | null;
}

interface DbCertificateDetail extends DbCertificate {
  studentName: string | null;
  courseTitle: string;
  reviewerName: string | null;
}

interface ReviewCertificateRequest {
  status: 'approved' | 'rejected';
  remark?: string;
}

interface GenerateCertificateRequest {
  studentId: string;
  courseId: string;
  score?: number;
}

const formatCertificate = (row: DbCertificateDetail): Certificate & {
  studentName?: string | null;
  courseTitle?: string;
  reviewerName?: string | null;
} => {
  return {
    id: row.id,
    studentId: row.studentId,
    courseId: row.courseId,
    score: row.score,
    issuedAt: row.issuedAt,
    status: row.status as CertificateStatus,
    reviewedAt: row.reviewedAt,
    reviewerId: row.reviewerId,
    remark: row.remark,
    studentName: row.studentName,
    courseTitle: row.courseTitle,
    reviewerName: row.reviewerName
  };
};

router.use(authenticateToken);

router.get('/', (req: Request, res: Response): void => {
  const { studentId, status, page = '1', pageSize = '20' } = req.query as {
    studentId?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limit = Math.max(1, Math.min(100, parseInt(pageSize, 10)));
  const offset = (pageNum - 1) * limit;

  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (studentId) {
    conditions.push('c.studentId = ?');
    params.push(studentId);
  }
  if (status) {
    conditions.push('c.status = ?');
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM certificates c ${whereClause}`;
  const totalResult = db.prepare(countSql).get(...params) as { total: number };
  const total = totalResult.total;

  const sql = `
    SELECT c.*, u.realName as studentName, co.title as courseTitle, ur.realName as reviewerName
    FROM certificates c
    LEFT JOIN users u ON c.studentId = u.id
    LEFT JOIN courses co ON c.courseId = co.id
    LEFT JOIN users ur ON c.reviewerId = ur.id
    ${whereClause}
    ORDER BY c.issuedAt DESC, c.id DESC
    LIMIT ? OFFSET ?
  `;
  const rows = db.prepare(sql).all(...params, limit, offset) as DbCertificateDetail[];

  const certificates = rows.map(formatCertificate);

  const result: PaginatedResult<ReturnType<typeof formatCertificate>> = {
    items: certificates,
    total,
    page: pageNum,
    pageSize: limit,
    totalPages: Math.ceil(total / limit)
  };

  res.json(success(result));
});

router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const sql = `
    SELECT c.*, u.realName as studentName, co.title as courseTitle, ur.realName as reviewerName
    FROM certificates c
    LEFT JOIN users u ON c.studentId = u.id
    LEFT JOIN courses co ON c.courseId = co.id
    LEFT JOIN users ur ON c.reviewerId = ur.id
    WHERE c.id = ?
  `;
  const row = db.prepare(sql).get(id) as DbCertificateDetail | undefined;

  if (!row) {
    res.status(404).json(error('证书不存在', 404));
    return;
  }

  res.json(success(formatCertificate(row)));
});

router.put('/:id/review', requireRole('dean', 'admin'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as ReviewCertificateRequest;

  if (!body.status || !['approved', 'rejected'].includes(body.status)) {
    res.status(400).json(error('无效的审核状态，必须为 approved 或 rejected', 400));
    return;
  }

  const existing = db.prepare('SELECT id, status FROM certificates WHERE id = ?').get(id) as DbCertificate | undefined;
  if (!existing) {
    res.status(404).json(error('证书不存在', 404));
    return;
  }

  if (existing.status === 'approved' || existing.status === 'rejected') {
    res.status(400).json(error('该证书已审核，不可重复审核', 400));
    return;
  }

  const now = new Date().toISOString();
  const reviewerId = req.user?.id;

  db.prepare(`
    UPDATE certificates
    SET status = ?, reviewedAt = ?, reviewerId = ?, remark = ?
    WHERE id = ?
  `).run(body.status, now, reviewerId, body.remark || null, id);

  const sql = `
    SELECT c.*, u.realName as studentName, co.title as courseTitle, ur.realName as reviewerName
    FROM certificates c
    LEFT JOIN users u ON c.studentId = u.id
    LEFT JOIN courses co ON c.courseId = co.id
    LEFT JOIN users ur ON c.reviewerId = ur.id
    WHERE c.id = ?
  `;
  const updated = db.prepare(sql).get(id) as DbCertificateDetail;

  res.json(success(formatCertificate(updated), '审核成功'));
});

router.get('/:id/preview', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const sql = `
    SELECT c.*, u.realName as studentName, u.username as studentUsername,
           co.title as courseTitle, co.credits as courseCredits, co.subject as courseSubject,
           ur.realName as reviewerName
    FROM certificates c
    LEFT JOIN users u ON c.studentId = u.id
    LEFT JOIN courses co ON c.courseId = co.id
    LEFT JOIN users ur ON c.reviewerId = ur.id
    WHERE c.id = ?
  `;
  const row = db.prepare(sql).get(id) as (DbCertificateDetail & {
    studentUsername: string;
    courseCredits: number;
    courseSubject: string | null;
  }) | undefined;

  if (!row) {
    res.status(404).json(error('证书不存在', 404));
    return;
  }

  const previewData = {
    id: row.id,
    certificateNo: `VOCEDU-${new Date(row.issuedAt || Date.now()).getFullYear()}-${row.id.slice(0, 8).toUpperCase()}`,
    student: {
      id: row.studentId,
      name: row.studentName || row.studentUsername,
      username: row.studentUsername
    },
    course: {
      id: row.courseId,
      title: row.courseTitle,
      credits: row.courseCredits,
      subject: row.courseSubject
    },
    score: row.score,
    status: row.status,
    issuedAt: row.issuedAt,
    reviewedAt: row.reviewedAt,
    reviewerName: row.reviewerName,
    remark: row.remark
  };

  res.json(success(previewData));
});

router.post('/generate', requireRole('dean', 'admin', 'teacher'), (req: Request, res: Response): void => {
  const body = req.body as GenerateCertificateRequest;

  if (!body.studentId || !body.courseId) {
    res.status(400).json(error('学生ID和课程ID不能为空', 400));
    return;
  }

  const student = db.prepare('SELECT id, realName, username FROM users WHERE id = ? AND role = ?').get(body.studentId, 'student');
  if (!student) {
    res.status(404).json(error('学生不存在', 404));
    return;
  }

  const course = db.prepare('SELECT id, title FROM courses WHERE id = ?').get(body.courseId);
  if (!course) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  let score = body.score;
  if (score === undefined) {
    const examAttempt = db.prepare(`
      SELECT ea.score
      FROM exam_attempts ea
      JOIN exams e ON ea.examId = e.id
      WHERE ea.studentId = ? AND e.courseId = ? AND ea.submittedAt IS NOT NULL
      ORDER BY ea.submittedAt DESC
      LIMIT 1
    `).get(body.studentId, body.courseId) as { score: number } | undefined;
    score = examAttempt?.score ?? 0;
  }

  const existing = db.prepare('SELECT id FROM certificates WHERE studentId = ? AND courseId = ?').get(body.studentId, body.courseId);
  if (existing) {
    res.status(400).json(error('该学生已存在该课程的证书', 400));
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO certificates (id, studentId, courseId, score, issuedAt, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(id, body.studentId, body.courseId, score, now);

  const sql = `
    SELECT c.*, u.realName as studentName, co.title as courseTitle, ur.realName as reviewerName
    FROM certificates c
    LEFT JOIN users u ON c.studentId = u.id
    LEFT JOIN courses co ON c.courseId = co.id
    LEFT JOIN users ur ON c.reviewerId = ur.id
    WHERE c.id = ?
  `;
  const created = db.prepare(sql).get(id) as DbCertificateDetail;

  res.status(201).json(success(formatCertificate(created), '证书生成成功'));
});

export default router;
