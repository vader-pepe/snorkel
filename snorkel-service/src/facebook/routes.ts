import express from "express"
import { instagramFlow } from "./controller"

const router = express.Router();

router.post(
  '/login',
  (req, res) => {
    instagramFlow(req, res);
  }
);

export default router;
