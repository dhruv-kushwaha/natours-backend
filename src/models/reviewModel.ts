import mongoose, { Model } from "mongoose";
import { TReviewType } from "../schema/reviewSchema";

export interface IReviewMethods {}

export type ReviewModel = Model<TReviewType, object, IReviewMethods>;

const reviewSchema = new mongoose.Schema<
  TReviewType,
  ReviewModel,
  IReviewMethods
>(
  {
    review: {
      type: String,
      required: [true, "Please provide a review"],
    },

    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: [1, "The review must be greater than or equal to 1"],
      max: [5, "The review must be less than or equal to 5"],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<unknown, unknown>)
    // .populate({ path: "tour", select: "name" })
    .populate({ path: "user", select: "name photo" });
  next();
});

const Review = mongoose.model<TReviewType, ReviewModel>("Review", reviewSchema);
export default Review;
