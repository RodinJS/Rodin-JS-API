import express from 'express';
import editorCtrl from '../controllers/editor';
import check from '../controllers/check';
import config from '../../config/env';

const router = express.Router();	// eslint-disable-line new-cap

router.route('/tree')
	.get(check.ifTokenValid, editorCtrl.getTreeJSON);

router.route('/serve')
	.get(check.ifTokenValid, editorCtrl.getFile)
	.put(check.ifTokenValid, editorCtrl.putFile)
	.post(check.ifTokenValid, editorCtrl.postFile)
	.delete(check.ifTokenValid, check.project, editorCtrl.deleteFile);

router.route('/:id')
	.get(check.ifTokenValid, editorCtrl.getTreeJSON);

export default router;