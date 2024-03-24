import express from "express";
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from "../controllers/tourController";
import { getId } from "../middlewares/getIdMiddleware";
import { parseBody } from "../middlewares/zodSchemaMiddleware";
import { TourSchema, UpdateTourSchema } from "../schema/tourSchema";
import { authenticateJwt } from "../middlewares/authMiddleware";
import { restrict } from "../controllers/restrictMiddleware";

const router = express.Router();

router.get("/top-5-cheap", aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router
  .route("/")
  .get(authenticateJwt, getAllTours)
  .post(parseBody(TourSchema), createTour);

router
  .route("/:id")
  .all(getId)
  .get(getTour)
  .patch(parseBody(UpdateTourSchema), updateTour)
  .delete(authenticateJwt, restrict("admin", "lead-guide"), deleteTour);

// router.param("id", checkID);
export default router;
