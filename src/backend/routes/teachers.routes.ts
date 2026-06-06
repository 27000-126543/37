import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole, requireMinRole } from '../middleware/permission.js';
import { success, error } from '../utils/response.js';
import { ROLE_LEVELS } from '../utils/permission.js';
import type { CourseApplication, ApplicationStatus, PaginatedResult } from '../types/index.js';

const router = Router();

interface DbApplication {
  id: string;
  teacherId: string;
  title: string;
  subject: string | null;
  outline: string | null;
  cv: string | null;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerId: string | null;
  remark: string | null;
  autoRejectedAt: string | null;
}

interface DbApplicationDetail extends DbApplication {
  teacherName: string | null;
  teacherEmail: string | null;
  reviewerName: string | null;
}

interface CreateApplicationRequest {
  title: string;
  subject?: string;
  outline?: string;
  cv?: string;
}

interface DeanReviewRequest {
  status: 'pending_expert' | 'rejected';
  remark?: string;
}

interface ExpertReviewRequest {
  status: 'approved' | 'rejected';
  remark?: string;
}

const formatApplication = (row: DbApplicationDetail): CourseApplication & {
  teacherName?: string | null;
  teacherEmail?: string | null;
  reviewerName?: string | null;
} => {
  return {
    id: row.id,
    teacherId: row.teacherId,
    title: row.title,
    subject: row.subject,
    outline: row.outline,
    cv: row.cv,
    status: row.status as ApplicationStatus,
    submittedAt: row.submittedAt,
    reviewedAt: row.reviewedAt,
    reviewerId: row.reviewerId,
    remark: row.remark,
    autoRejectedAt: row.autoRejectedAt,
    teacherName: row.teacherName,
    teacherEmail: row.teacherEmail,
    reviewerName: row.reviewerName
  };
};

router.use(authenticateToken);

router.get('/', (req: Request, res: Response): void => {
  const { status, teacherId, page = '1', pageSize = '20' } = req.query as {
    status?: string;
    teacherId?: string;
    page?: string;
    pageSize?: string;
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limit = Math.max(1, Math.min(100, parseInt(pageSize, 10)));
  const offset = (pageNum - 1) * limit;

  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (status) {
    conditions.push('ca.status = ?');
    params.push(status);
  }
  if (teacherId) {
    conditions.push('ca.teacherId = ?');
    params.push(teacherId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM course_applications ca ${whereClause}`;
  const totalResult = db.prepare(countSql).get(...params) as { total: number };
  const total = totalResult.total;

  const sql = `
    SELECT ca.*, u.realName as teacherName, u.email as teacherEmail, ur.realName as reviewerName
    FROM course_applications ca
    LEFT JOIN users u ON ca.teacherId = u.id
    LEFT JOIN users ur ON ca.reviewerId = ur.id
    ${whereClause}
    ORDER BY ca.submittedAt DESC, ca.id DESC
    LIMIT ? OFFSET ?
  `;
  const rows = db.prepare(sql).all(...params, limit, offset) as DbApplicationDetail[];

  const applications = rows.map(formatApplication);

  const result: PaginatedResult<ReturnType<typeof formatApplication>> = {
    items: applications,
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
    SELECT ca.*, u.realName as teacherName, u.email as teacherEmail, ur.realName as reviewerName
    FROM course_applications ca
    LEFT JOIN users u ON ca.teacherId = u.id
    LEFT JOIN users ur ON ca.reviewerId = ur.id
    WHERE ca.id = ?
  `;
  const row = db.prepare(sql).get(id) as DbApplicationDetail | undefined;

  if (!row) {
    res.status(404).json(error('开课申请不存在', 404));
    return;
  }

  res.json(success(formatApplication(row)));
});

router.post('/', requireRole('teacher'), (req: Request, res: Response): void => {
  const body = req.body as CreateApplicationRequest;

  if (!body.title) {
    res.status(400).json(error('课程标题不能为空', 400));
    return;
  }

  const teacherId = req.user?.id;
  if (!teacherId) {
    res.status(401).json(error('用户未认证', 401));
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO course_applications (id, teacherId, title, subject, outline, cv, status, submittedAt)
    VALUES (?, ?, ?, ?, ?, ?, 'pending_dean', ?)
  `).run(
    id,
    teacherId,
    body.title,
    body.subject || null,
    body.outline || null,
    body.cv || null,
    now
  );

  const sql = `
    SELECT ca.*, u.realName as teacherName, u.email as teacherEmail, ur.realName as reviewerName
    FROM course_applications ca
    LEFT JOIN users u ON ca.teacherId = u.id
    LEFT JOIN users ur ON ca.reviewerId = ur.id
    WHERE ca.id = ?
  `;
  const created = db.prepare(sql).get(id) as DbApplicationDetail;

  res.status(201).json(success(formatApplication(created), '申请提交成功'));
});

router.put('/:id/dean-review', requireRole('dean', 'admin'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as DeanReviewRequest;

  if (!body.status || !['pending_expert', 'rejected'].includes(body.status)) {
    res.status(400).json(error('无效的审核状态，必须为 pending_expert 或 rejected', 400));
    return;
  }

  const existing = db.prepare('SELECT id, status FROM course_applications WHERE id = ?').get(id) as DbApplication | undefined;
  if (!existing) {
    res.status(404).json(error('开课申请不存在', 404));
    return;
  }

  if (existing.status !== 'pending_dean') {
    res.status(400).json(error('当前申请状态不允许教务初审', 400));
    return;
  }

  const now = new Date().toISOString();
  const reviewerId = req.user?.id;

  db.prepare(`
    UPDATE course_applications
    SET status = ?, reviewedAt = ?, reviewerId = ?, remark = ?
    WHERE id = ?
  `).run(body.status, now, reviewerId, body.remark || null, id);

  const sql = `
    SELECT ca.*, u.realName as teacherName, u.email as teacherEmail, ur.realName as reviewerName
    FROM course_applications ca
    LEFT JOIN users u ON ca.teacherId = u.id
    LEFT JOIN users ur ON ca.reviewerId = ur.id
    WHERE ca.id = ?
  `;
  const updated = db.prepare(sql).get(id) as DbApplicationDetail;

  res.json(success(formatApplication(updated), '教务初审完成'));
});

router.put('/:id/expert-review', requireMinRole(ROLE_LEVELS.dean), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as ExpertReviewRequest;

  if (!body.status || !['approved', 'rejected'].includes(body.status)) {
    res.status(400).json(error('无效的审核状态，必须为 approved 或 rejected', 400));
    return;
  }

  const existing = db.prepare('SELECT id, status FROM course_applications WHERE id = ?').get(id) as DbApplication | undefined;
  if (!existing) {
    res.status(404).json(error('开课申请不存在', 404));
    return;
  }

  if (existing.status !== 'pending_expert') {
    res.status(400).json(error('当前申请状态不允许专家终审', 400));
    return;
  }

  const now = new Date().toISOString();
  const reviewerId = req.user?.id;

  db.prepare(`
    UPDATE course_applications
    SET status = ?, reviewedAt = ?, reviewerId = ?, remark = ?
    WHERE id = ?
  `).run(body.status, now, reviewerId, body.remark || null, id);

  const sql = `
    SELECT ca.*, u.realName as teacherName, u.email as teacherEmail, ur.realName as reviewerName
    FROM course_applications ca
    LEFT JOIN users u ON ca.teacherId = u.id
    LEFT JOIN users ur ON ca.reviewerId = ur.id
    WHERE ca.id = ?
  `;
  const updated = db.prepare(sql).get(id) as DbApplicationDetail;

  res.json(success(formatApplication(updated), '专家终审完成'));
});

router.get('/check-auto-reject', requireRole('dean', 'admin'), (_req: Request, res: Response): void => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const pendingStatuses = ['pending_dean', 'pending_expert', 'pending', 'pending_first_review', 'pending_final_review'];
  const placeholders = pendingStatuses.map(() => '?').join(', ');

  const findSql = `
    SELECT id FROM course_applications
    WHERE submittedAt < ? AND status IN (${placeholders}) AND autoRejectedAt IS NULL
  `;
  const pendingApps = db.prepare(findSql).all(sevenDaysAgo, ...pendingStatuses) as Array<{ id: string }>;

  if (pendingApps.length === 0) {
    res.json(success({ processedCount: 0 }, '没有需要处理的超期申请'));
    return;
  }

  const now = new Date().toISOString();
  const updateStmt = db.prepare(`
    UPDATE course_applications
    SET status = 'rejected', autoRejectedAt = ?, remark = '超期未审核自动驳回'
    WHERE id = ?
  `);

  const updateMany = db.transaction((apps: Array<{ id: string }>) => {
    for (const app of apps) {
      updateStmt.run(now, app.id);
    }
  });

  updateMany(pendingApps);

  res.json(success({ processedCount: pendingApps.length }, `已自动处理 ${pendingApps.length} 个超期申请`));
});

export default router;
