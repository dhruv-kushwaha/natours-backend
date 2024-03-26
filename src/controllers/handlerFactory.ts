import { Model } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import { StatusCode } from "../utils/globalConstants";

type ModelType = Model<any, object, any>;

export const deleteOne = function (Model: ModelType, id: string) {
  return asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const docId = req.headers[id] ?? req.params[id];
    const doc = await Model.findByIdAndDelete(docId);

    if (!doc) {
      return next(
        new AppError("No document found with that ID", StatusCode.NOT_FOUND),
      );
    }

    res.status(StatusCode.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  });
};

export const updateOne = function (Model: ModelType, id: string) {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const docId = req.headers[id] ?? req.params[id];
      const updatedDoc = await Model.findOneAndUpdate(
        {
          _id: docId,
        },
        req.body,
        {
          // new : true ? returns the newly updated document
          new: true,
          runValidators: true,
        },
      );

      if (!updatedDoc) {
        return next(
          new AppError("No document found with that ID", StatusCode.NOT_FOUND),
        );
      }

      res.status(StatusCode.OK).json({
        status: "success",
        data: {
          data: updatedDoc,
        },
      });
    },
  );
};

export const createOne = function (Model: ModelType) {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const body = req.body;

      const newDoc = await Model.create(body);

      res.status(StatusCode.CREATED).json({
        status: "success",
        data: {
          data: newDoc,
        },
      });
    },
  );
};

interface PopOptionsType {
  path: string;
  select?: string;
}

export const getOne = function (
  Model: ModelType,
  id: string,
  popOptions?: PopOptionsType | undefined,
) {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const docId = req.headers[id] ?? req.params[id];

      const query = Model.findById(docId);
      if (popOptions) query.populate(popOptions);
      const doc = await query;

      if (!doc) {
        return next(
          new AppError("No document found with that ID", StatusCode.NOT_FOUND),
        );
      }

      res.status(StatusCode.OK).json({
        status: "success",
        data: {
          data: doc,
        },
      });
    },
  );
};
