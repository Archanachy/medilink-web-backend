import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';
  console.error("[ErrorHandler] Error caught:");
  console.error("[ErrorHandler]   statusCode:", statusCode);
  console.error("[ErrorHandler]   message:", message);
  console.error("[ErrorHandler]   stack:", err?.stack);
  console.error("[ErrorHandler]   full error:", err);
  
  res.status(statusCode).json({ success: false, message });
}
