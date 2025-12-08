import express from "express";
import {
    upsertTravelStatus,
    getAllTravelStatus,
    getTravelStatus,
    deleteTravelStatus,
} from "../controllers/travelStatus.controller.js";

import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/", verifyToken, upsertTravelStatus);
router.get("/", verifyToken, getAllTravelStatus);
router.get("/:cca3", verifyToken, getTravelStatus);
router.delete("/:cca3", verifyToken, deleteTravelStatus);

export default router;
