import express from "express"
import { fileUploadFlow } from "./index"
import multer from "multer";
import path from "path";
const router = express.Router();

const storage = path.resolve('./src/storage/')

const disk = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, storage)
  },
  filename: (_req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + file?.originalname?.match(/\..*$/)?.[0]
    );
  },
})

const upload = multer({
  storage: disk
})

router.post(
  '/file',
  upload.single('picture'),
  (req, res) => {
    fileUploadFlow(req, res);
  }
);

export default router;
