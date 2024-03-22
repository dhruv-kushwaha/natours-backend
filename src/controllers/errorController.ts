import { NextFunction, Request, Response } from "express";
import AppError, { DBError } from "../utils/AppError";
import mongoose, { Error as MongooseError, mongo } from "mongoose";
import { JsonWebTokenError } from "jsonwebtoken";
import { MongoError } from "mongodb";
import { StatusCode } from "../utils/globalConstants";

const handleCastErrorDB = (err: mongoose.Error.CastError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongoError) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);

  // const duplicateField = Object.keys(err.errors)[0]; // Assuming there's only one duplicate field
  // const duplicateValue = err.errors[duplicateField]?.value;
  // const message = `Duplicate field value: ${duplicateValue}. Please use another value!`;
  // return new AppError(message, 400);
};
const handleValidationErrorDB = (err: mongoose.Error.ValidationError) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleValidatorError = (err: mongoose.Error.ValidatorError) =>
  new AppError(err.message, StatusCode.BAD_REQUEST);

const handleJWTError = () =>
  new AppError("Invalid Token. Please Login again", 401);

const handleJWTExpiredError = () =>
  new AppError("Token Expired. Please Login Again", 401);

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

export default function globalErrorHandler(
  err: Error | AppError | MongooseError | JsonWebTokenError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // console.log(err.stack);

  let error: AppError;

  if (err instanceof AppError) {
    error = err as AppError;
  } else {
    error = new DBError(err);
  }

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    console.log("Entered Production");

    if (err instanceof mongoose.Error) {
      console.log("Entered Mongoose");
      // error = err as DBError;
      if (err instanceof mongoose.Error.CastError)
        error = handleCastErrorDB(err);
      else if (err instanceof mongoose.Error.ValidationError) {
        // if (err.code === 11000) error = handleDuplicateFieldsDB(err);
        // else {
        error = handleValidationErrorDB(err);
        // }
      } else if (err instanceof MongoError) {
        console.log("Entered Mongodb mongoose");
        if (err.code === 11000) error = handleDuplicateFieldsDB(err);
      }
    } else if (err instanceof mongoose.Error.ValidatorError) {
      error = handleValidatorError(err);
    } else if (err instanceof MongoError) {
      console.log("Entered Mongodb ");
      if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    } else if (err instanceof JsonWebTokenError) {
      if (error.name === "JsonWebTokenError") {
        error = handleJWTError();
      } else if (error.name === "TokenExpiredError")
        error = handleJWTExpiredError();
    }

    console.log(err);
    sendErrorProd(error as AppError, res);
  }
}
