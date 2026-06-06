import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db/index.js';
import { authenticateToken, requireRole } from '@/middleware/auth.js';

const router = Router();

interface DbUser {
  id: string;
  username: string;
  name: string | null;
  realName: string | null;
  password: string;
  role: string;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  title: string | null;
  registeredAt: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  status: string;
  profile: string | null;
}

interface CreateUserRequest {
  username: string;
  password?: string;
  name?: string;
  realName?: string;
  role?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  department?: string;
  title?: string;
  status?: 'active' | 'inactive' | 'disabled';
  profile?: Record<string, unknown>;
}

interface UpdateUserRequest {
  name?: string;
  realName?: string;
  role?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  department?: string;
  title?: string;
  status?: 'active' | 'inactive' | 'disabled';
  profile?: Record<string, unknown>;
}

interface UpdateStatusRequest {
  status: 'active' | 'inactive' | 'disabled';
}

const formatUser = (row: DbUser): Record<string, unknown> => {
  let parsedProfile: Record<string, unknown> | null = null;
  if (row.profile) {
    try {
      parsedProfile = JSON.parse(row.profile) as Record<string, unknown>;
    } catch {
      parsedProfile = null;
    }
  }
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    realName: row.realName,
    role: row.role,
    avatar: row.avatar,
    email: row.email,
    phone: row.phone,
    department: row.department,
    title: row.title,
    registeredAt: row.registeredAt,
    createdAt: row.createdAt,
    lastLoginAt: row.lastLoginAt,
    status: row.status,
    profile: parsedProfile
  };
};

router.use(authenticateToken);
router.use(requireRole(['admin']));

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

  const sql = `SELECT * FROM users ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
  const rows = db.prepare(sql).all(...params, limit, offset) as DbUser[];

  const users = rows.map(formatUser);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: pageNum,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
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
    INSERT INTO users (id, username, name, realName, password, role, avatar, email, phone, department, title, registeredAt, createdAt, status, profile)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.prepare(sql).run(
    id,
    body.username,
    body.name || null,
    body.realName || null,
    hashedPassword,
    role,
    body.avatar || null,
    body.email || null,
    body.phone || null,
    body.department || null,
    body.title || null,
    now,
    now,
    status,
    body.profile ? JSON.stringify(body.profile) : null
  );

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser;

  res.status(201).json({
    success: true,
    data: formatUser(user)
  });
});

router.put('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const body = req.body as UpdateUserRequest;

  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ success: false, message: '用户不存在' });
    return;
  }

  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name || null); }
  if (body.realName !== undefined) { fields.push('realName = ?'); values.push(body.realName || null); }
  if (body.role !== undefined) { fields.push('role = ?'); values.push(body.role); }
  if (body.avatar !== undefined) { fields.push('avatar = ?'); values.push(body.avatar || null); }
  if (body.email !== undefined) { fields.push('email = ?'); values.push(body.email || null); }
  if (body.phone !== undefined) { fields.push('phone = ?'); values.push(body.phone || null); }
  if (body.department !== undefined) { fields.push('department = ?'); values.push(body.department || null); }
  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title || null); }
  if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }
  if (body.profile !== undefined) { fields.push('profile = ?'); values.push(body.profile ? JSON.stringify(body.profile) : null); }

  if (fields.length === 0) {
    res.status(400).json({ success: false, message: '没有需要更新的字段' });
    return;
  }

  values.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...values);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser;

  res.json({
    success: true,
    data: formatUser(user)
  });
});

router.delete('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;

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
  const { id } = req.params;
  const { status } = req.body as UpdateStatusRequest;

  const validStatuses = ['active', 'inactive', 'disabled'];
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
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser;

  res.json({
    success: true,
    data: formatUser(user)
  });
});

router.post('/:id/reset-password', (req: Request, res: Response): void => {
  const { id } = req.params;

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
