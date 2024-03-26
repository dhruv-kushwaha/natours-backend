import { NextFunction, Response } from "express";
import AuthenticatedRequest from "../utils/authenticatedRequest";
import AppError from "../utils/AppError";
import { StatusCode } from "../utils/globalConstants";

export const restrict = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role ?? "")) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          StatusCode.UNAUTHORIZED,
        ),
      );
    }

    next();
  };
};
