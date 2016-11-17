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
     * @api {get} /api/editor/serve  Get file content
     * @apiName GetFileContent
     * @apiGroup Editor
     * @apiVersion 0.0.1
     *
     *
     * @apiParam {String} id            Project ID.
     * @apiParam {String} filename      Name and path of file.
     *
     * @apiParamExample {json} Request-Example:
     *     {
	 *          "id": "58062416fe0fd0a179742d5c",
	 *          "filename": "somefile.js"
	 *     }
     * @apiSuccess (200) {Boolean} success                Success Status.
     * @apiSuccess (200) {Object}  data                      Response data.
     * @apiSuccess (200) {String}  data.content           Content of file
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
	 *         "success": true,
     *			"data": {
     *    			"content": "[1,2,3].map(n => n + 1);"
     *			}
	 *     }
     *
     *
     */
    .get(check.ifTokenValid, check.project, editorCtrl.getFile)

    /**
     * @api {PUT} /api/editor/serve  Edit file
     * @apiName EditFile
     * @apiGroup Editor
     * @apiVersion 0.0.1
     *
     *
     * @apiParam {String} id            Project ID.
     * @apiParam {String} filename      Name and path of file.
     * @apiParam {String} newName       New file name works with rename action.
     * @apiParam {String} action        rename or save
     *
     * @apiSuccess (200) {Boolean} success   Success Status.
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
	 *         "success": true,
	 *     }
     *
     *
     */
    .put(check.ifTokenValid, check.project, check.validateStorage, editorCtrl.putFile)


    /**
     * @api {POST} /api/editor/serve  Add file/folder
     * @apiName AddFileFolder
     * @apiGroup Editor
     * @apiVersion 0.0.1
     *
     * @apiParam {String} id            Project ID.
     * @apiParam {String} name          File or folder name.
     * @apiParam {String} action        create or copy.
     * @apiParam {String} type          file or directory
     * @apiParam {String} content       Content of file (works with create action)
     * @apiParam {String} path        Main folder path
     * @apiParam {String} copyName      Name of new file during copy (works with copy action)
     *
     * @apiSuccess (200) {Boolean} success                Success Status.
     * @apiSuccess (200) {String}  data                   Response status.
     *
     *   @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
	 *         "success": true,
	 *         "data": "The folder was created!"
	 *     }
     *
     *
     */
    .post(check.ifTokenValid, check.project, check.validateStorage, editorCtrl.postFile)


    /**
     * @api {DELETE} /api/editor/serve  Remove file/folder
     * @apiName RemoveFileFolder
     * @apiGroup Editor
     * @apiVersion 0.0.1
     *
     * @apiParam {String} id            Project ID.
     * @apiParam {String} filename      File or folder name.
     *
     * @apiSuccess (200) {Boolean} success                Success Status.
     * @apiSuccess (200) {String}  data                   Response status (path of file).
     *
     *   @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
	 *        "success": true,
     *		  "data": "projects/xgharibyan/xproject/a.js"
	 *     }
     *
     *
     */
    .delete(check.ifTokenValid, check.project, editorCtrl.deleteFile);

/**
 *
 */
router.route('/search')
    .get(check.ifTokenValid, check.project, editorCtrl.searchInsideFiles);

/**
 * @api {POST} /api/editor/upload  Upload file/folder
 * @apiName UploadFileFolder
 * @apiGroup Editor
 * @apiVersion 0.0.1
 *
 * @apiParam {String} id            Project ID.
 * @apiParam {String} path          path of upload root, folder, subfolder.
 * @apiParam {String} destination   end point of upload.
 * @apiParam {String} folderName    Create new Folder
 * @apiParam {Array}  file          Array of files
 * @apiParam {String} action        replace, rename This action should be work if in folder exists file with same name.
 *
 * @apiSuccess (200) {Boolean} success                Success Status.
 * @apiSuccess (200) {String}  data                   Response status (path of file).
 *
 *   @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *           "data": "Files successfuly uploaded!"
 *     }
 *
 *
 */
router.route("/upload")
    .post(upload.array('file'), check.ifTokenValid, check.project, check.validateStorage, editorCtrl.isUnitTest, editorCtrl.uploadFiles);

router.route('/:id')
    .get(check.ifTokenValid, editorCtrl.getTreeJSON);

export default router;