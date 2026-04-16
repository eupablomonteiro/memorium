import type { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ErrorHandler {
  static handle(
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    const statusCode = err.statusCode || 500;

    console.error(`Erro ${statusCode}: `, err.message);

    res.status(statusCode).json({
      success: false,
      error: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  static operational(message: string, statusCode = 400): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
  }

  static programming(message: string): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = 500;
    error.isOperational = false;
    return error;
  }
}
