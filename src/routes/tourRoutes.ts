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
import { restrict } from "../middlewares/restrictMiddleware";
import reviewRouter from "./reviewRoutes";

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

router.get("/top-5-cheap", aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);

router
  .route("/monthly-plan/:year")
  .get(
    authenticateJwt,
    restrict("admin", "lead-guide", "guide"),
    getMonthlyPlan,
  );

router
  .route("/")
  .get(getAllTours)
  .post(
    authenticateJwt,
    restrict("admin", "lead-guide"),
    parseBody(TourSchema),
    createTour,
  );

router
  .route("/:tourId")
  .all(getId("tourId"))
  .get(getTour)
  .all(authenticateJwt, restrict("admin", "lead-guide"))
  .patch(parseBody(UpdateTourSchema), updateTour)
  .delete(deleteTour);

// router
//   .route("/:tourId/reviews")
//   .post(
//     authenticateJwt,
//     restrict("user"),
//     getId("tourId"),
//     setTourUserIds,
//     parseBody(CreateReviewSchema),
//     createReview,
//   );

// router.param("id", checkID);
export default router;
