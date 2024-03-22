import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import AppError from "../utils/AppError";
import { StatusCode } from "../utils/globalConstants";

export const parseBody = function <T extends z.ZodTypeAny>(Schema: T) {
  return function (req: Request, res: Response, next: NextFunction): void {
    const rawBody = req.body;
    const parseResult = Schema.safeParse(rawBody);

    if (parseResult.success === false) {
      return next(
        new AppError(
          `Invalid body payload`,
          StatusCode.BAD_REQUEST,
          parseResult.error
        )
      );
    }

    req.body = parseResult.data;
    next();

    // return parseResult.data;
  };
};
