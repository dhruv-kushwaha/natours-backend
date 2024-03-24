import mongoose from "mongoose";
import { TTourType } from "../schema/tourSchema";
import slugify from "slugify";
import { User } from "./userModel";
import { TUserType } from "../schema/userSchema";

const tourSchema = new mongoose.Schema<TTourType>(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      minlength: [10, "A tour name must have 10 or more characters"],
      maxlength: [40, "A tour name must have 40 or less characters"],
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },

    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },

    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,

      // validate: {
      //   validator: function (val: number) {
      //     // this only points to current doc on NEW document creation

      //     return val < (this as any).price;
      //   },
      //   message: "Discount price ({VALUE}) should be below regular price",
      // },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },

    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    guides: Array,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", async function (next) {
//   if (this.guides && this.guides.length > 0) {
//     const guidesPromises = this.guides.map(async (id) => {
//       const guide = await User.findById(id);
//       return guide;
//     });

//     this.guides = (await Promise.all(guidesPromises)).filter(
//       Boolean,
//     ) as unknown as string[];
//   }
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  // (this as mongoose.Query<any, any, {}, any, "/^find/i">).find({
  (this as mongoose.Query<any, any>)
    .find({
      secretTour: { $ne: true },
    })
    .select("-__v");
  (this as any).start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - (this as any).start} milliseconds`);

  next();
});

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true,
      },
    },
  });

  next();
});

const Tour = mongoose.model<TTourType>("Tour", tourSchema);
export default Tour;
