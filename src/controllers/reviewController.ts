import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Review from "../models/reviewModel";
import { StatusCode } from "../utils/globalConstants";
import { createOne, deleteOne, getOne, updateOne } from "./handlerFactory";

export const setTourUserIds = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.headers.userId;
  next();
};

export const getAllReviews = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let filter: object = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(StatusCode.OK).json({
    status: "success",
    results: reviews.length,
    data: { reviews },
  });
});

export const getReview = getOne(Review, "reviewId");
export const createReview = createOne(Review);
export const updateReview = updateOne(Review, "reviewId");
export const deleteReview = deleteOne(Review, "reviewId");
