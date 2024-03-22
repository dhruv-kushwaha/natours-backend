import z from "zod";

export const BasicTourSchema = z.object({
  name: z
    .string({ required_error: "A tour must have a name" })
    .trim()
    .min(10, { message: "A tour name must have 10 or more characters" })
    .max(40, { message: "A tour must have atmost 40 characters" }),

  slug: z.string().optional(),

  duration: z.number({ required_error: "A tour must have a duration" }),

  maxGroupSize: z.number({ required_error: "A tour must have a group size" }),

  difficulty: z.enum(["easy", "medium", "difficult"], {
    required_error: "Difficulty is either: easy, medium, difficult",
  }),

  ratingsAverage: z
    .number()
    .min(1, { message: "Rating must be above 1.0" })
    .max(5, { message: "Rating must be below 5.0" })
    .optional()
    .default(4.5),

  ratingsQuantity: z.number().optional().default(0),

  price: z.number({ required_error: "A tour must have a price" }),
  priceDiscount: z.number().optional(),

  summary: z.string({ required_error: "A tour must have a summary" }).trim(),

  description: z.string().trim().optional(),

  imageCover: z.string({ required_error: "A tour must have a cover image" }),

  images: z.array(z.string()).optional(),

  createdAt: z.date().optional(),

  startDates: z.array(z.string().or(z.date())).optional(),
  secretTour: z.boolean().optional().default(false),
});

const refineFunction = (val: any) => val.price > val.priceDiscount;
const refineConfig = {
  path: ["priceDiscount"],
  message: `Discount price should be below regular price`,
};

export const TourSchema = BasicTourSchema.refine(refineFunction, refineConfig);

export const UpdateTourSchema = BasicTourSchema.omit({
  createdAt: true,
})
  .partial()
  .refine(refineFunction, refineConfig);

export type TTourType = z.infer<typeof TourSchema>;
