import type { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error('[Error]', err.message, err.stack);

  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json(error(message, statusCode));
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json(error(`请求的路径 ${req.method} ${req.originalUrl} 不存在`, 404));
}
