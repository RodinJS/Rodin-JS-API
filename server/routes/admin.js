/**
 * Created by Reinchard on 6/27/2017.
 */
import express from 'express';
import adminCtrl from '../controllers/admin';
import check from '../controllers/check';

const router = express.Router();	// eslint-disable-line new-cap

router.route('/user')
  .get(check.isGod, adminCtrl.getAllUsers);

router.route('/user/:username')
  .get(check.isGod,adminCtrl.getByUsername)
  .put(check.isGod, adminCtrl.update)
  .delete(check.isGod, adminCtrl.remove);

router.route('/projects')
  .get(check.checkAdminPermission, adminCtrl.getProjects);
router.route('/counts')
  .get(adminCtrl.getCounts);



export default router;
