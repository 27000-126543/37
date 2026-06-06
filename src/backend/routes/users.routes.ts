import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/permission.js';
import type { User, UserRole, UserStatus, PaginatedResult } from '../types/index.js';

const router = Router();

interface DbUser {
  id: string;
  role: string;
  username: string;
  password: string;
  realName: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  status: string;
  createdAt: string;
}

interface CreateUserRequest {
  username: string;
  password?: string;
  role?: UserRole;
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
}

interface UpdateUserRequest {
  role?: UserRole;
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
}

interface UpdateStatusRequest {
  status: UserStatus;
}

const formatUser = (row: DbUser): Omit<User, 'password'> => {
  return {
    id: row.id,
    role: row.role as User['role'],
    username: row.username,
    realName: row.realName,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar,
    status: row.status as User['status'],
    createdAt: row.createdAt
  };
};

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/', (req: Request, res: Response): void => {
  const { role, page = '1', pageSize = '20' } = req.query as {
    role?: string;
    page?: string;
    pageSize?: string;
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limit = Math.max(1, Math.min(100, parseInt(pageSize, 10)));
  const offset = (pageNum - 1) * limit;

  let whereClause = '';
  const params: Array<string | number> = [];

  if (role) {
    whereClause = 'WHERE role = ?';
    params.push(role);
  }

  const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
  const totalResult = db.prepare(countSql).get(...params) as { total: number };
  const total = totalResult.total;

  const sql = `SELECT id, role, username, realName, email, phone, avatar, status, createdAt FROM users ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
  const rows = db.prepare(sql).all(...params, limit, offset) as DbUser[];

  const users = rows.map(formatUser);

  const result: PaginatedResult<Omit<User, 'password'>> = {
    items: users,
    total,
    page: pageNum,
    pageSize: limit,
    totalPages: Math.ceil(total / limit)
  };

  res.json({
    success: true,
    data: result
  });
});

router.post('/', (req: Request, res: Response): void => {
  const body = req.body as CreateUserRequest;

  if (!body.username) {
    res.status(400).json({ success: false, message: '用户名不能为空' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(body.username);
  if (existing) {
    res.status(400).json({ success: false, message: '用户名已存在' });
    return;
  }

  const id = uuidv4();
  const password = body.password || '123456';
  const hashedPassword = bcrypt.hashSync(password, 10);
  const role = body.role || 'student';
  const status = body.status || 'active';
  const now = new Date().toISOString();

  const sql = `
    INSERT INTO users (id, role, username, password, realName, email, phone, avatar, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.prepare(sql).run(
    id,
    role,
    body.username,
    hashedPassword,
    body.realName || null,
    body.email || null,
    body.phone || null,
    body.avatar || null,
    status,
    now
  );

  const user = db
    .prepare('SELECT id, role, username, realName, email, phone, avatar, status, createdAt FROM users WHERE id = ?')
    .get(id) as DbUser;

  res.status(201).json({
    success: true,
    data: formatUser(user)
  });
});

router.put('/:id', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateUserRequest;

  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ success: false, message: '用户不存在' });
    return;
  }

  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (body.role !== undefined) { fields.push('role = ?'); values.push(body.role); }
  if (body.realName !== undefined) { fields.push('realName = ?'); values.push(body.realName || null); }
  if (body.email !== undefined) { fields.push('email = ?'); values.push(body.email || null); }
  if (body.phone !== undefined) { fields.push('phone = ?'); values.push(body.phone || null); }
  if (body.avatar !== undefined) { fields.push('avatar = ?'); values.push(body.avatar || null); }
  if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }

  if (fields.length === 0) {
    res.status(400).json({ success: false, message: '没有需要更新的字段' });
    return;
  }

  values.push(id as string);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...values);

  const user = db
    .prepare('SELECT id, role, username, realName, email, phone, avatar, status, createdAt FROM users WHERE id = ?')
    .get(id) as DbUser;

  res.json({
    success: true,
    data: formatUser(user)
  });
});

router.delete('/:id', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ success: false, message: '用户不存在' });
    return;
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);

  res.json({
    success: true,
    data: { message: '用户已删除' }
  });
});

router.patch('/:id/status', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const { status } = req.body as UpdateStatusRequest;

  const validStatuses: UserStatus[] = ['active', 'inactive', 'disabled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: '无效的状态值' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ success: false, message: '用户不存在' });
    return;
  }

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
  const user = db
    .prepare('SELECT id, role, username, realName, email, phone, avatar, status, createdAt FROM users WHERE id = ?')
    .get(id) as DbUser;

  res.json({
    success: true,
    data: formatUser(user)
  });
});

router.post('/:id/reset-password', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ success: false, message: '用户不存在' });
    return;
  }

  const hashedPassword = bcrypt.hashSync('123456', 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);

  res.json({
    success: true,
    data: { message: '密码已重置为 123456' }
  });
});

export default router;
