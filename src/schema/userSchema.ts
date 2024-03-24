import z from "zod";

export const BasicUserSchema = z.object({
  _id: z.string(),
  name: z
    .string({
      required_error: "Please provide your name",
    })
    .trim(),

  email: z
    .string({
      required_error: "Please provide your email",
    })
    .email({
      message: "Please provide a valid email",
    })
    .toLowerCase()
    .trim(),

  photo: z.string().optional(),
  role: z
    .enum(["user", "guide", "lead-guide", "admin"])
    .optional()
    .default("user"),

  password: z
    .string({
      required_error: "Please provide a password",
    })
    .min(8),

  passwordConfirm: z
    .string({
      required_error: "Please confirm your password",
    })
    .min(8),
  passwordChangedAt: z.date(),
  passwordResetToken: z.string(),
  passwordResetExpires: z.date(),
  active: z.boolean().optional().default(true),
});

const refineFunction = (val: any) => val.password === val.passwordConfirm;
const refineConfig = {
  path: ["passwordConfirm"],
  message: `Passwords are not the same!`,
};

const UserSchema = BasicUserSchema.omit({
  _id: true,
  passwordChangedAt: true,
  passwordResetExpires: true,
  passwordResetToken: true,
});

export const CreateUserSchema = UserSchema.refine(refineFunction, refineConfig);

export const LoginSchema = UserSchema.pick({
  email: true,
  password: true,
});

export const ResetPasswordSchema = UserSchema.pick({
  password: true,
  passwordConfirm: true,
}).refine(refineFunction, refineConfig);

export const UpdatePasswordSchema = UserSchema.pick({
  password: true,
  passwordConfirm: true,
})
  .extend({
    currentPassword: z
      .string({
        required_error: "Please provide the current password",
      })
      .min(8, { message: "Password must be greater than 8 characters" }),
  })
  .refine(refineFunction, refineConfig);

export type TUserType = z.infer<typeof BasicUserSchema>;
