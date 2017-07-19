/**
 * Created by Reinchard on 6/27/2017.
 */
import express from 'express';
import adminCtrl from '../controllers/admin';
import check from '../controllers/check';

const router = express.Router();	// eslint-disable-line new-cap

//Users CRUD
router.route('/user')
  .get(check.isGod, adminCtrl.getAllUsers);

router.route('/user/:username')
  .get(check.isGod, adminCtrl.getUserByUsername)
  .put(check.isGod, adminCtrl.updateUserById)
  .delete(check.isGod, adminCtrl.removeUserById);

// Projects CRUD
router.route('/projects')
  .get(check.checkAdminPermission, adminCtrl.getProjects);

router.route('/projects/:id')
  .get(check.checkAdminPermission, adminCtrl.getProjectById, adminCtrl.finalizeProjects)
  .put(check.checkAdminPermission, adminCtrl.updateProjectById);

router.route('/projects/:owner/:id')
  .delete(check.checkAdminPermission, adminCtrl.getProjectById, adminCtrl.deleteProjectById);


//Module Crud

router.route('/modules')
  .get(check.checkAdminPermission, adminCtrl.getAllModules);

router.route('/modules/:id')
  .get(check.checkAdminPermission, adminCtrl.getModuleById)
  .put(check.checkAdminPermission, adminCtrl.updateModuleById);

//Counts
router.route('/counts')
  .get(adminCtrl.getCounts);


export default router;
