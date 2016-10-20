import express from 'express';
import editorCtrl from '../controllers/editor';
import check from '../controllers/check';
import config from '../../config/env';
import multer from 'multer';

const router = express.Router();	// eslint-disable-line new-cap
const upload = multer();

// router.route('/tree')
// 	.get(check.ifTokenValid, editorCtrl.getTreeJSON);

router.route('/serve')

	/**
	 * @api {get} /api/editor/serve  get file content
	 * @apiName GetFileContent
	 * @apiGroup Project
	 * @apiVersion 0.0.1
	 *
	 *
	 * @apiParam {String} id        Project ID.
	 * @apiParam {String} filename     Name of file.
	 * @apiParam {String} [firstname]  Firstname of the User.
	 * @apiParam {String} [lastname]   Lastname of the User.
	 *
	 * @apiParamExample {json} Request-Example:
	 *     {
	 *          "email": "project@example.com",
	 *          "password": "s0meStr0ngPassw0rd!"
	 *     }
	 *
	 */
	.get(check.ifTokenValid, check.project, editorCtrl.getFile)

	/**
	 * @api {PUT} /api/editor/serve  Edit file
	 * @apiName GetFileContent
	 * @apiGroup Project
	 * @apiVersion 0.0.1
	 *
	 */
	.put(check.ifTokenValid, check.project, editorCtrl.putFile)


	/**
	 * @api {POST} /api/editor/serve  Add file/folder
	 * @apiName GetFileContent
	 * @apiGroup Project
	 * @apiVersion 0.0.1
	 *
	 */
	.post(check.ifTokenValid, check.project,  editorCtrl.postFile)
	.delete(check.ifTokenValid, check.project, editorCtrl.deleteFile);

router.route("/upload").post(upload.array('file'), check.ifTokenValid, check.project, editorCtrl.uploadFiles);

router.route('/:id')
	.get(check.ifTokenValid, editorCtrl.getTreeJSON);

export default router;