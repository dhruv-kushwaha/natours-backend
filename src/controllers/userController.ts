import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../utils/globalConstants";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/userModel";
import AppError from "../utils/AppError";
import { deleteOne, getOne, updateOne } from "./handlerFactory";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find();

  res.status(StatusCode.OK).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

export const updateMe = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        StatusCode.BAD_REQUEST,
      ),
    );
  }

  // Only photo can be updated
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
});

export const deleteMe = asyncHandler(async function (
  req: Request,
  res: Response,
) {
  await User.findByIdAndUpdate(req.headers.userId, {
    active: false,
  });

  res.status(StatusCode.NO_CONTENT).json({
    status: "success",
    data: null,
  });
});

export const getUser = getOne(User, "userId");

export const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use \\signup ",
  });
};

// Do not update Password with this
export const updateUser = updateOne(User, "userId");

export const deleteUser = deleteOne(User, "userId");
