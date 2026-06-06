import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/db/index.js';
import { authenticateToken, JWT_SECRET, JWT_EXPIRES_IN } from '@/middleware/auth.js';

const router = Router();

interface DbUserWithPassword {
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

interface DbUser {
  id: string;
  username: string;
  name: string | null;
  realName: string | null;
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

interface LoginRequest {
  username: string;
  password: string;
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

router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body as LoginRequest;

  if (!username || !password) {
    res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    return;
  }

  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username) as DbUserWithPassword | undefined;

  if (!user) {
    res.status(401).json({ success: false, message: '用户名或密码错误' });
    return;
  }

  if (user.status === 'disabled') {
    res.status(403).json({ success: false, message: '账户已被禁用' });
    return;
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    res.status(401).json({ success: false, message: '用户名或密码错误' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  db.prepare('UPDATE users SET lastLoginAt = datetime(\'now\') WHERE id = ?').run(user.id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  const userData = formatUser(user);
  delete (userData as Record<string, unknown>).password;

  res.json({
    success: true,
    data: {
      token,
      user: userData
    }
  });
});

router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.json({
    success: true,
    data: { message: '已成功登出' }
  });
});

router.get('/me', authenticateToken, (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未认证' });
    return;
  }

  const user = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(req.user.id) as DbUser | undefined;

  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' });
    return;
  }

  res.json({
    success: true,
    data: formatUser(user)
  });
});

export default router;
