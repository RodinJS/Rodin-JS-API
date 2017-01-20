/**
 * Created by xgharibyan on 11/3/16.
 */

import express from 'express';
import check from '../controllers/check';
import modulesCtrl from '../controllers/modules';

const router = express.Router();

router.route('/')
  .get(modulesCtrl.list)
  .post(check.isGod, modulesCtrl.create);

router.route('/mine')
  .get(check.ifTokenValid, modulesCtrl.getMyModules);

router.route('/subscribe')
  .post(check.ifTokenValid, modulesCtrl.getById, modulesCtrl.subscribe);

router.route('/assign')
  .post(check.ifTokenValid, modulesCtrl.checkIsSubscribed, modulesCtrl.getById,  modulesCtrl.assignToProject);

export default router;
