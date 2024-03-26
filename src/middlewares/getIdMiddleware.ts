import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "../utils/AppError";
import { StatusCode } from "../utils/globalConstants";

export const getId = function (idField: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      const id: string = req.params[idField];
      console.log(id);

      // if (!mongoose.isValidObjectId(id)) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(
          new AppError("Invalid document id", StatusCode.BAD_REQUEST),
        );
      }

      req.headers[idField] = id as string;
      next();
    } catch (err) {
      next(err);
    }
  };
};
