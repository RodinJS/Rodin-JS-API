import express from 'express';
import editorCtrl from '../controllers/editor';
import check from '../controllers/check';
import config from '../../config/env';

const router = express.Router();	// eslint-disable-line new-cap

router.route('/tree')
	.get(check.ifTokenValid, editorCtrl.getTreeJSON);

router.route('/serve')
	.get(check.ifTokenValid, editorCtrl.serve);

router.route('/:projectId')
	.get(check.ifTokenValid, editorCtrl.getProject);

export default router;