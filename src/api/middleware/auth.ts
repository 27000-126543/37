import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { error } from '../utils/response.js';

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
  realName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key-change-in-production';

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  if (!token && req.cookies) {
    token = req.cookies.token as string | undefined;
  }

  if (!token) {
    res.status(401).json(error('未提供认证令牌', 401));
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      realName: decoded.realName,
    };
    next();
  } catch {
    res.status(401).json(error('无效或过期的认证令牌', 401));
  }
}
