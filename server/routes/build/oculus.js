import express from 'express';
import OculusBuildController from '../../controllers/build/oculus'

const router = express.Router();

router.route('/')
  .post(OculusBuildController.build)
  .delete(OculusBuildController.remove);

export default router;
