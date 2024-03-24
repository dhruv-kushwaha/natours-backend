import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "../utils/AppError";
import { StatusCode } from "../utils/globalConstants";

export const getId = function getId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id: string = req.params.id;
    console.log(id);

    // if (!mongoose.isValidObjectId(id)) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid document id", StatusCode.BAD_REQUEST));
    }

    req.headers.id = id as string;
    next();
  } catch (err) {
    next(err);
  }
};
