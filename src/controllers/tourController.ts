import { NextFunction, Request, Response } from "express";
import Tour from "../models/tourModel";
import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import { StatusCode } from "../utils/globalConstants";
import APIFeatures from "../utils/apiFeatures";
import { createOne, deleteOne, getOne, updateOne } from "./handlerFactory";

export const aliasTopTours = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
});

export const getAllTours = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // const tours = await Tour.find(filters);
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

export const getTour = getOne(Tour, "tourId", { path: "reviews" });

export const createTour = createOne(Tour);

export const updateTour = updateOne(Tour, "tourId");

export const deleteTour = deleteOne(Tour, "tourId");

export const getTourStats = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },

    {
      $group: {
        // The field to groupby
        // _id: null,
        _id: {
          $toUpper: "$difficulty",
        },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  if (!stats) {
    return next(new AppError("Statistics not found", StatusCode.NOT_FOUND));
  }

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

export const getMonthlyPlan = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const year = Number(req.params.year);

  const plan = await Tour.aggregate([
    {
      // deconstruct an array field from the input document
      // and o/p 1 document for each element of the array
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: {
          $month: "$startDates",
        },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },

    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },

    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { plan },
  });
});
