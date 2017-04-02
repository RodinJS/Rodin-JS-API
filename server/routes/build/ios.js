import express from 'express';
import IOSBuildController from '../../controllers/build/ios';

const router = express.Router();

router.route('/')
  .post(IOSBuildController.build)
  .delete(IOSBuildController.remove);

export default router;
