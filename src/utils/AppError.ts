import { MongooseError } from "mongoose";

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  error: any;

  constructor(message: string, statusCode: number, error?: any) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // Used to distinguish operational errors from programming errors
    // All the errors we create ourself are operational error
    this.isOperational = true;

    this.error = error;

    Error.captureStackTrace(this, this.constructor);
  }
}

class DBError extends AppError {
  mongooseErr: MongooseError;

  constructor(err: MongooseError) {
    super(err.message, 500);
    this.mongooseErr = err;
  }
}

export { DBError };
export default AppError;
