import ErrorHandler from "../utils/errorhandler";
import { NextFunction, Request, Response } from "express";

// Error Handling Middleware
export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Set default status code and message
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Handling Mongoose CastError (Invalid ObjectId)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Handling Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]; // Extracts the field causing the duplication
    const message = `Duplicate field value entered: ${field}. Please use a different value.`;
    err = new ErrorHandler(message, 400);
  }

  // Handling JWT Invalid Error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please try again.";
    err = new ErrorHandler(message, 401);
  }

  // Handling JWT Expired Error
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired. Please log in again.";
    err = new ErrorHandler(message, 401);
  }


  // Send the error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
