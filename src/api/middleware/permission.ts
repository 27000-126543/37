import type { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response.js';
import { ROLE_LEVELS, type UserRole } from '../utils/permission.js';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(error('用户未认证', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json(error('权限不足，禁止访问', 403));
      return;
    }

    next();
  };
}

export function requireMinRole(level: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(error('用户未认证', 401));
      return;
    }

    const userLevel = ROLE_LEVELS[req.user.role as UserRole] ?? 0;

    if (userLevel < level) {
      res.status(403).json(error('权限不足，禁止访问', 403));
      return;
    }

    next();
  };
}
