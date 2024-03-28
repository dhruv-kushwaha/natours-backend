import express from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  setTourUserIds,
  updateReview,
} from "../controllers/reviewController";
import { authenticateJwt } from "../middlewares/authMiddleware";
import { restrict } from "../middlewares/restrictMiddleware";
import { parseBody } from "../middlewares/zodSchemaMiddleware";
import { CreateReviewSchema } from "../schema/reviewSchema";
import { getId } from "../middlewares/getIdMiddleware";

const router = express.Router({ mergeParams: true });

router.use(authenticateJwt);
router
  .route("/")
  .get(getAllReviews)
  .post(
    restrict("user"),
    setTourUserIds,
    parseBody(CreateReviewSchema),
    createReview,
  );

router
  .route("/:reviewId")
  .all(getId("reviewId"))
  .get(getReview)
  .all(restrict("user", "admin"))
  .patch(updateReview)
  .delete(deleteReview);

export default router;
