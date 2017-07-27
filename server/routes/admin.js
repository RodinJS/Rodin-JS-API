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
  .get(check.isGod, adminCtrl.getUserByUsername)
  .put(check.isGod, adminCtrl.updateUserById)
  .delete(check.isGod, adminCtrl.removeUserById);

router.route('/projects')
  .get(check.checkAdminPermission, adminCtrl.getProjects);

router.route('/projects/:id')
  .get(check.checkAdminPermission, adminCtrl.getByProjectId, adminCtrl.finalizeProjects)
  .put(check.checkAdminPermission, adminCtrl.updateProjectById);

router.route('/projects/:owner/:id')
  .delete(check.checkAdminPermission, adminCtrl.getByProjectId, adminCtrl.deleteProjectById);

router.route('/counts')
  .get(adminCtrl.getCounts);


export default router;
