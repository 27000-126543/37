import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { authenticateToken, JWT_SECRET, JWT_EXPIRES_IN } from '../middleware/auth.js';
import type { User, JwtPayload as JwtPayloadType } from '../types/index.js';

const router = Router();

interface DbUserWithPassword {
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

interface DbUser {
  id: string;
  role: string;
  username: string;
  realName: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  status: string;
  createdAt: string;
}

interface LoginRequest {
  username: string;
  password: string;
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

  const payload: JwtPayloadType = {
    id: user.id,
    username: user.username,
    role: user.role as JwtPayloadType['role']
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    data: {
      token,
      user: formatUser(user)
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
    .prepare('SELECT id, role, username, realName, email, phone, avatar, status, createdAt FROM users WHERE id = ?')
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
