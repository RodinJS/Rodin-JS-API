import express from "express";
import DownloadController from "../controllers/download";

const router = express.Router();

router.route('/ios')
  .get(DownloadController.ios);

router.route('/android')
  .get(DownloadController.android);

export default router;
