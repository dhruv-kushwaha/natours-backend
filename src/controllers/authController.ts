import jwt from "jsonwebtoken";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/userModel";
import { StatusCode } from "../utils/globalConstants";
import { TUserType } from "../schema/userSchema";
import AppError from "../utils/AppError";
import { sendEmail } from "../utils/email";

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

function createSendToken(res: Response, user: TUserType, statusCode: number) {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        24 * 60 * 60 * 1000 * Number(process.env.JWT_COOKIE_EXPIRES_IN),
    ),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined as unknown as string;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
}

export const signup = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(res, newUser, StatusCode.CREATED);
});

export const login = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = await User.findOne({
    email: req.body.email,
  }).select("+password -__v");

  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(
      new AppError("Incorrect email or password", StatusCode.UNAUTHENTICATED),
    );
  }

  createSendToken(res, user, StatusCode.OK);
});

export const forgotPassword = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // 1) Get user based on the provided email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(
        "There is no user with that email addresss",
        StatusCode.NOT_FOUND,
      ),
    );
  }

  // 2) create a new password reset token
  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  // 3) Send the reset token via email
  const resetURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(StatusCode.OK).json({
      status: "success",
      message: "Token send to email",
    });
  } catch (error) {
    console.log(error);

    user.passwordResetExpires = undefined as unknown as Date;
    user.passwordResetToken = undefined as unknown as string;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        StatusCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
});

export const resetPassword = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date(Date.now()) },
  });

  if (!user) {
    return next(
      new AppError("Token is invalid or has expired", StatusCode.BAD_REQUEST),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined as unknown as string;
  user.passwordResetExpires = undefined as unknown as Date;
  await user.save();

  createSendToken(res, user, StatusCode.OK);
});

export const updatePassword = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = await User.findById(req.headers.userId).select("+password");

  if (!user) {
    return next(
      new AppError("No user found with that id", StatusCode.NOT_FOUND),
    );
  }

  if (!user.correctPassword(req.body.password, user.password)) {
    return next(
      new AppError("Your current password is wrong", StatusCode.BAD_REQUEST),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(res, user, StatusCode.OK);
});
