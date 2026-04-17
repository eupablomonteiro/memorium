import { Router } from "express";
import { uploadConfig } from "./config/upload.config.js";
import { UploadController } from "./upload.controller.js";

const router = Router();
const uploadController = new UploadController();

router.post(
  "/upload",
  uploadConfig.array("files", 100),
  uploadController.upload.bind(uploadController),
);

export default router;
