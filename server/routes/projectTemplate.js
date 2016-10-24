import express from 'express';
import check from '../controllers/check';
import projectTemplateCtrl from '../controllers/projectTemplate';

const router = express.Router();

router.route('/')
  .get(check.ifTokenValid, projectTemplateCtrl.list);

export default router;
