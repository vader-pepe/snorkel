import status from "@/constants/status";
import { Request, Response } from "express";

export const fileUploadFlow = (req: Request, res: Response) => {
  const filename = req.file?.filename;

  try {
    res.status(status.HTTP_200_OK).json({
      status: status.HTTP_200_OK,
      message: 'OK',
      file: filename
    });
  } catch (error: any) {
    const errorMsg = error.message as string
    res.status(status.HTTP_404_NOT_FOUND).json({
      status: status.HTTP_404_NOT_FOUND,
      message: errorMsg,
    });
  }
}
