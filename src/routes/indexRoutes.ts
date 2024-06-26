import express from "express";
import tourRouter from "./tourRoutes";
import userRouter from "./tourRoutes";

const router = express.Router();

router.use("/tours", tourRouter);
router.use("/users", userRouter);

export default router;
