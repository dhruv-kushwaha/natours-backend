import express from "express";
import {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  updateMe,
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
import { authenticateJwt } from "../middlewares/authMiddleware";
import { restrict } from "../middlewares/restrictMiddleware";

const router = express.Router();

router.route("/signup").post(parseBody(CreateUserSchema), signup);
router.route("/login").post(parseBody(LoginSchema), login);

router.route("/forgotPassword").post(forgotPassword);
router
  .route("/resetPassword/:token")
  .patch(parseBody(ResetPasswordSchema), resetPassword);

router.use(authenticateJwt);

router
  .route("/updateMyPassword")
  .patch(parseBody(UpdatePasswordSchema), updatePassword);

router.get("/me", getMe);
// Implement this
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

router.use(restrict("admin"));
router.route("/").get(getAllUsers).post(createUser);

router.route("/:userId").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
