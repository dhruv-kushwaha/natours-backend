import express from "express";
import {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/userController";
import { parseBody } from "../middlewares/zodSchemaMiddleware";
import {
  CreateUserSchema,
  LoginSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
} from "../schema/userSchema";
import {
  forgotPassword,
  login,
  resetPassword,
  signup,
  updatePassword,
} from "../controllers/authController";
import { getId } from "../middlewares/getIdMiddleware";
import { authenticateJwt } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/signup").post(parseBody(CreateUserSchema), signup);
router.route("/login").post(parseBody(LoginSchema), login);

router.route("/forgotPassword").post(forgotPassword);
router
  .route("/resetPassword/:token")
  .patch(parseBody(ResetPasswordSchema), resetPassword);

router
  .route("/updateMyPassword")
  .patch(authenticateJwt, parseBody(UpdatePasswordSchema), updatePassword);

router.patch("/updateMe", authenticateJwt, deleteMe);
router.delete("/deleteMe", authenticateJwt, deleteMe);

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
