import express from "express"
import { facebookLoginFlow } from "./controller"

const router = express.Router();

router.post(
  '/login',
  (req, res) => {
    facebookLoginFlow(req, res);
  }
);

export default router;
