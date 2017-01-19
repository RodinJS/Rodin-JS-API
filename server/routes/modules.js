/**
 * Created by xgharibyan on 11/3/16.
 */

import express from 'express';
import check from '../controllers/check';
import config from '../../config/env';
import modulesCtrl from '../controllers/modules';

const router = express.Router();

router.route('/')
  .get(modulesCtrl.list)
  .post(check.isGod, modulesCtrl.create);

router.route('/subscribe')
  .post(check.ifTokenValid, modulesCtrl.getById, modulesCtrl.subscribe);

export default router;
