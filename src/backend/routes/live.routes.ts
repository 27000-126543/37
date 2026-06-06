import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole, requireMinRole } from '../middleware/permission.js';
import { success, error } from '../utils/response.js';
import { ROLE_LEVELS } from '../utils/permission.js';
import type { Danmaku, LiveSession, PaginatedResult } from '../types/index.js';

interface DbLiveSession {
  id: string;
  courseId: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  recordingUrl: string | null;
}

interface DbDanmaku {
  id: string;
  liveSessionId: string;
  userId: string;
  content: string;
  isBlocked: number;
  blockReason: string | null;
  createdAt: string;
}

interface CreateLiveRequest {
  courseId: string;
  title: string;
  startTime?: string | null;
  endTime?: string | null;
}

interface UpdateLiveRequest {
  title?: string;
  startTime?: string | null;
  endTime?: string | null;
  status?: string;
  recordingUrl?: string | null;
}

interface SendDanmakuRequest {
  content: string;
}

const SENSITIVE_WORDS = ['傻逼', '操你', 'fuck', 'shit', '垃圾', '滚蛋'];

const filterSensitiveWords = (content: string): { filtered: boolean; reason: string | null } => {
  for (const word of SENSITIVE_WORDS) {
    if (content.toLowerCase().includes(word.toLowerCase())) {
      return { filtered: true, reason: `包含敏感词：${word}` };
    }
  }
  return { filtered: false, reason: null };
};

const formatLiveSession = (row: DbLiveSession): LiveSession => ({
  id: row.id,
  courseId: row.courseId,
  title: row.title,
  startTime: row.startTime,
  endTime: row.endTime,
  status: row.status as LiveSession['status'],
  recordingUrl: row.recordingUrl,
});

const formatDanmaku = (row: DbDanmaku): Danmaku => ({
  id: row.id,
  liveSessionId: row.liveSessionId,
  userId: row.userId,
  content: row.content,
  isBlocked: row.isBlocked ? 1 : 0,
  blockReason: row.blockReason,
  createdAt: row.createdAt,
});

const liveRouter = Router();
liveRouter.use(authenticateToken);

liveRouter.get('/', (req: Request, res: Response): void => {
  const { courseId, status, page = '1', pageSize = '20' } = req.query as {
    courseId?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limit = Math.max(1, Math.min(100, parseInt(pageSize, 10)));
  const offset = (pageNum - 1) * limit;

  const whereClauses: string[] = [];
  const params: Array<string | number> = [];

  if (courseId) {
    whereClauses.push('courseId = ?');
    params.push(courseId);
  }
  if (status) {
    whereClauses.push('status = ?');
    params.push(status);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM live_sessions ${whereClause}`;
  const totalResult = db.prepare(countSql).get(...params) as { total: number };
  const total = totalResult.total;

  const sql = `SELECT * FROM live_sessions ${whereClause} ORDER BY COALESCE(startTime, rowid) DESC LIMIT ? OFFSET ?`;
  const rows = db.prepare(sql).all(...params, limit, offset) as DbLiveSession[];

  const items = rows.map(formatLiveSession);

  const result: PaginatedResult<LiveSession> = {
    items,
    total,
    page: pageNum,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };

  res.json(success(result));
});

liveRouter.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const live = db.prepare('SELECT * FROM live_sessions WHERE id = ?').get(id) as DbLiveSession | undefined;
  if (!live) {
    res.status(404).json(error('直播会话不存在', 404));
    return;
  }

  res.json(success(formatLiveSession(live)));
});

liveRouter.post('/', requireMinRole(ROLE_LEVELS.teacher), (req: Request, res: Response): void => {
  const body = req.body as CreateLiveRequest;

  if (!body.courseId || !body.title) {
    res.status(400).json(error('课程ID和标题不能为空', 400));
    return;
  }

  const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(body.courseId);
  if (!course) {
    res.status(404).json(error('关联课程不存在', 404));
    return;
  }

  const id = uuidv4();

  db.prepare(`
    INSERT INTO live_sessions (id, courseId, title, startTime, endTime, status, recordingUrl)
    VALUES (?, ?, ?, ?, ?, 'not_started', NULL)
  `).run(
    id,
    body.courseId,
    body.title,
    body.startTime || null,
    body.endTime || null,
  );

  const created = db.prepare('SELECT * FROM live_sessions WHERE id = ?').get(id) as DbLiveSession;
  res.status(201).json(success(formatLiveSession(created), '创建直播成功', 201));
});

liveRouter.put('/:id', requireMinRole(ROLE_LEVELS.teacher), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateLiveRequest;

  const existing = db.prepare('SELECT id FROM live_sessions WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('直播会话不存在', 404));
    return;
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title); }
  if (body.startTime !== undefined) { fields.push('startTime = ?'); values.push(body.startTime || null); }
  if (body.endTime !== undefined) { fields.push('endTime = ?'); values.push(body.endTime || null); }
  if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }
  if (body.recordingUrl !== undefined) { fields.push('recordingUrl = ?'); values.push(body.recordingUrl || null); }

  if (fields.length === 0) {
    res.status(400).json(error('没有需要更新的字段', 400));
    return;
  }

  values.push(id);
  const sql = `UPDATE live_sessions SET ${fields.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...values);

  const updated = db.prepare('SELECT * FROM live_sessions WHERE id = ?').get(id) as DbLiveSession;
  res.json(success(formatLiveSession(updated), '更新成功'));
});

liveRouter.delete('/:id', requireMinRole(ROLE_LEVELS.teacher), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM live_sessions WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('直播会话不存在', 404));
    return;
  }

  db.prepare('DELETE FROM live_sessions WHERE id = ?').run(id);
  res.json(success({ message: '删除成功' }));
});

const danmakuRouter = Router();
danmakuRouter.use(authenticateToken);

danmakuRouter.get('/:sessionId', (req: Request, res: Response): void => {
  const { sessionId } = req.params as { sessionId: string };
  const { includeBlocked = 'false' } = req.query as { includeBlocked?: string };

  const live = db.prepare('SELECT id FROM live_sessions WHERE id = ?').get(sessionId);
  if (!live) {
    res.status(404).json(error('直播会话不存在', 404));
    return;
  }

  const whereClause = includeBlocked === 'true'
    ? 'WHERE liveSessionId = ?'
    : 'WHERE liveSessionId = ? AND isBlocked = 0';

  const rows = db
    .prepare(`SELECT * FROM danmakus ${whereClause} ORDER BY createdAt ASC`)
    .all(sessionId) as DbDanmaku[];

  res.json(success(rows.map(formatDanmaku)));
});

danmakuRouter.post('/:sessionId', requireRole('student'), (req: Request, res: Response): void => {
  const { sessionId } = req.params as { sessionId: string };
  const body = req.body as SendDanmakuRequest;

  if (!req.user) {
    res.status(401).json(error('用户未认证', 401));
    return;
  }

  if (!body.content || body.content.trim().length === 0) {
    res.status(400).json(error('弹幕内容不能为空', 400));
    return;
  }

  const live = db.prepare('SELECT id FROM live_sessions WHERE id = ?').get(sessionId);
  if (!live) {
    res.status(404).json(error('直播会话不存在', 404));
    return;
  }

  const { filtered, reason } = filterSensitiveWords(body.content);
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO danmakus (id, liveSessionId, userId, content, isBlocked, blockReason, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    sessionId,
    req.user.id,
    body.content,
    filtered ? 1 : 0,
    filtered ? reason : null,
    now,
  );

  const created = db.prepare('SELECT * FROM danmakus WHERE id = ?').get(id) as DbDanmaku;

  if (filtered) {
    res.json(success(formatDanmaku(created), `弹幕已发送，但因内容违规已被过滤：${reason}`));
    return;
  }

  res.status(201).json(success(formatDanmaku(created), '弹幕发送成功', 201));
});

danmakuRouter.delete('/:danmakuId', requireMinRole(ROLE_LEVELS.assistant), (req: Request, res: Response): void => {
  const { danmakuId } = req.params as { danmakuId: string };

  const existing = db.prepare('SELECT id FROM danmakus WHERE id = ?').get(danmakuId);
  if (!existing) {
    res.status(404).json(error('弹幕不存在', 404));
    return;
  }

  db.prepare('DELETE FROM danmakus WHERE id = ?').run(danmakuId);
  res.json(success({ message: '弹幕已删除' }));
});

export { liveRouter, danmakuRouter };
export default liveRouter;
