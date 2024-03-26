import mongoose from "mongoose";
import z from "zod";

export const BasicReviewSchema = z.object({
  review: z.string({ required_error: "Please provide a review" }),
  rating: z
    .number({ required_error: "Please provide a rating" })
    .min(1, { message: "The review must be greater than or equal to 1" })
    .max(5, { message: "The review must be less than or equal to 5" }),

  createdAt: z.date().optional(),
  tour: z
    .string({ required_error: "Review must belong to a tour." })
    .or(z.instanceof(mongoose.Schema.ObjectId)),
  user: z
    .string({ required_error: "Review must belong to a user." })
    .or(z.instanceof(mongoose.Schema.ObjectId))
    .optional(),
});

export const CreateReviewSchema = BasicReviewSchema.omit({
  createdAt: true,
});

export type TReviewType = z.infer<typeof BasicReviewSchema>;
