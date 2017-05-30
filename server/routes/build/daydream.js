import express from 'express';
import DaydreamBuildController from '../../controllers/build/daydream';

const router = express.Router();

router.route('/')
  .post(DaydreamBuildController.build)
  .delete(DaydreamBuildController.remove);

export default router;
