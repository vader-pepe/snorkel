import express, { Request, Response } from "express"
import { getStatus } from "./controller"

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  getStatus(res);
});

export default router
