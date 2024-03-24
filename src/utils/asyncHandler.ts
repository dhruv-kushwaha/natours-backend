import { Request, Response, NextFunction } from "express";
import AuthenticatedRequest from "./authenticatedRequest";

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return async function (
    req: Request | AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

export { asyncHandler };
