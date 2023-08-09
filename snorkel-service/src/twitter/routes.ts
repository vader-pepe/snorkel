import express from "express"
import { twitterLoginFlow } from "./controller"

const router = express.Router();

router.post(
  '/login',
  (req, res) => {
    twitterLoginFlow(req, res);
  }
);

export default router;
