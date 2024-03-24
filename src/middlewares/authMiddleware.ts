import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import { StatusCode } from "../utils/globalConstants";
import { User } from "../models/userModel";
import AuthenticatedRequest from "../utils/authenticatedRequest";

export const authenticateJwt = asyncHandler(async function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  // 1. Get the token from cookie or req.headers
  // console.log(req.cookies);
  let token: string;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError(
          "Invalid or missing authorization header",
          StatusCode.UNAUTHENTICATED,
        ),
      );
    }

    token = authHeader.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError(
        "You are not logged in! Please log in to get access.",
        StatusCode.UNAUTHENTICATED,
      ),
    );
  }

  // 2. verify the token

  const payload: JwtPayload = (await jwt.verify(
    token,
    process.env.JWT_SECRET as string,
  )) as JwtPayload;

  // console.log(payload);

  // 3. Check if the user exists
  const currentUser = await User.findById(payload.id);

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        StatusCode.UNAUTHENTICATED,
      ),
    );
  }

  // 4. Check if user changed password after the token was published
  if (currentUser.changedPasswordAfter(payload.iat ?? 0)) {
    return next(
      new AppError(
        "User recently changed password! Please log in again.",
        StatusCode.UNAUTHENTICATED,
      ),
    );
  }

  // 5. if authenticated store payload in req.headers.userId

  req.headers.userId = payload.id;
  req.user = currentUser;
  next();
});
