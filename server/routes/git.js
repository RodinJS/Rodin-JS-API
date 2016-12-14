/**
 * Created by xgharibyan on 11/3/16.
 */

import express from 'express';
import gitCtrl from '../controllers/git';
import authCtrl from '../controllers/auth';

const router = express.Router();

router.route('/')
  .get(gitCtrl.getToken, gitCtrl.getUser, authCtrl.socialAuth, gitCtrl.successAuth);

router.route('/sync')
  .get(gitCtrl.getToken, gitCtrl.getUser, gitCtrl.successSync);


export default router;
