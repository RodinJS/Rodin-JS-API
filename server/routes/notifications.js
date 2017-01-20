/**
 * Created by xgharibyan on 11/3/16.
 */

import express from 'express';
import notificationsCtrl from '../controllers/notifications';
import check from '../controllers/check';

const router = express.Router();

router.route('/')
  .get(check.ifTokenValid, notificationsCtrl.get)
  .put(check.ifTokenValid, notificationsCtrl.update)
  .delete(check.ifTokenValid, notificationsCtrl.remove);

export default router;
