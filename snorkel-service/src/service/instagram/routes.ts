import express from "express"
import { instagramLoginFlow } from "./controller"

const router = express.Router();

router.post(
  '/login',
  (req, res) => {
    instagramLoginFlow(req, res);
  }
);

export default router;
