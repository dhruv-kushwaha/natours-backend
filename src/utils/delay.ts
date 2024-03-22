import { NextFunction, Request, Response } from "express";

export default function delayMiddleware(delay: number = 500) {
  return function (req: Request, res: Response, next: NextFunction) {
    setTimeout(next, delay);
  };
}
