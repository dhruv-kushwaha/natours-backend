import express from "express";
import tourRouter from "./tourRoutes";
import userRouter from "./userRoutes";
import reviewRouter from "./reviewRoutes";

const router = express.Router();

router.use("/tours", tourRouter);
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);

export default router;
