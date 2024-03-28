import mongoose, { Model, ObjectId } from "mongoose";
import { TReviewType } from "../schema/reviewSchema";
import Tour from "./tourModel";

export interface IReviewMethods {}

export type ReviewModel = Model<TReviewType, object, IReviewMethods>;

interface IReviewModel extends ReviewModel {
  calcAverageRatings(tourId: ObjectId): Promise<void>;
}

const reviewSchema = new mongoose.Schema<
  TReviewType,
  IReviewModel,
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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<unknown, unknown>)
    // .populate({ path: "tour", select: "name" })
    .populate({ path: "user", select: "name photo" });
  next();
});

reviewSchema.static("calcAverageRatings", async function (tourId: ObjectId) {
  console.log("entered");
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);
  console.log(tourId);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0]?.nRating || 0,
    ratingsAverage: Math.round(stats[0]?.avgRating * 100) / 100 || 4.5,
  });
});

reviewSchema.post("save", function (doc, next) {
  // Points to the current model => Review
  // (this.constructor as IReviewModel).calcAverageRatings(this.tour as ObjectId);
  (this.constructor as IReviewModel).calcAverageRatings(this.tour as ObjectId);
  next();
});

// These only have query middleware
// findByIdAndUpdate
// findByIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function (next) {
  const Model = this.model;

  const thisis = this as any;
  thisis.r = await (Model as any).findOne(thisis.getQuery());
  next();
});

reviewSchema.post(/^findOneAnd/, function (doc, next) {
  ((this as any).r.constructor as IReviewModel).calcAverageRatings(
    (this as any).r.tour as ObjectId,
  );

  next();
});

const Review = mongoose.model<TReviewType, IReviewModel>(
  "Review",
  reviewSchema,
);

export default Review;
