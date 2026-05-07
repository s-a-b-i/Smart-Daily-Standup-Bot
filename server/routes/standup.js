import express from "express";
import { createStandup, getCommitContext, getStandups } from "../controllers/standupController.js";

const router = express.Router();

router.get("/", getStandups);
router.get("/commits", getCommitContext);
router.post("/", createStandup);

export default router;
