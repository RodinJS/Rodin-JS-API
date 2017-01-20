import express from 'express';
import AndroidBuildController from '../../controllers/build/android';

const router = express.Router();

router.route('/')
  .post(AndroidBuildController.build)
  .delete(AndroidBuildController.remove);

export default router;
