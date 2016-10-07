import express from 'express';
import ViveBuildController from '../../controllers/build/vive'

const router = express.Router();

router.route('/')
  .post(ViveBuildController.build);

export default router;
