/**
 * Created by xgharibyan on 11/3/16.
 */

import express from 'express';
import hooksCtrl from '../controllers/hooks';

const router = express.Router();

router.route('/build/:id/:device')
  .post(hooksCtrl.validateKey, hooksCtrl.build);

export default router;
