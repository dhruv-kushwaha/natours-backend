import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { TUserType } from "../schema/userSchema";

export interface IUserMethods {
  correctPassword(reqPassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimeStamp: number): boolean;
  createPasswordResetToken(): string;
}

export type UserModel = Model<TUserType, object, IUserMethods>;
// type UserModel = Model<TUserType, {}, IUserMethods>;

const userSchema = new mongoose.Schema<TUserType, UserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, "Please provide your name."],
  },

  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
  },

  photo: String,

  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    // validate: {
    //   // This only works on CREATE and SAVE!!!
    //   validator: function (el : string) {
    //     return el === this.password;
    //   },
    //   message: "Passwords are not the same!",
    // },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Hash Password Middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const hashedPassword = await bcrypt.hash(this.password, 12);

  this.password = hashedPassword;
  this.passwordConfirm = undefined as unknown as string;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Query Middleware
userSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<any, any>).find({
    active: { $ne: false },
  });
  next();
});

// Instance Methods
// Confirm Password Method
userSchema.methods.correctPassword = async function (
  reqPassword: string,
  userPassword: string,
) {
  return await bcrypt.compare(reqPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      String(this.passwordChangedAt.getTime() / 1000),
      10,
    );

    return changedTimestamp > JWTTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export const User = mongoose.model<TUserType, UserModel>("User", userSchema);
