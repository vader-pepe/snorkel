import { Response } from "express";

export async function getStatus(res: Response): Promise<void> {
  res.status(200).json({ healthy: true });
}
