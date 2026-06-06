import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/index.js';
import type { JwtPayload } from '../types/index.js';

export { JWT_SECRET, JWT_EXPIRES_IN };

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

interface DbUserCheck {
  id: string;
  username: string;
  role: string;
  status: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  if (!token && req.cookies) {
    token = req.cookies.token as string | undefined;
  }

  if (!token) {
    res.status(401).json({ success: false, message: '未提供认证令牌' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = db
      .prepare('SELECT id, username, role, status FROM users WHERE id = ?')
      .get(decoded.id) as DbUserCheck | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: '用户不存在' });
      return;
    }

    if (user.status === 'disabled') {
      res.status(403).json({ success: false, message: '账户已被禁用' });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role as JwtPayload['role']
    };

    next();
  } catch {
    res.status(401).json({ success: false, message: '无效或已过期的令牌' });
  }
};

export const verifyToken = authenticateToken;

export default authenticateToken;
