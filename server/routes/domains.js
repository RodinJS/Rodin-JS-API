import express from 'express';
import domainsCtrl from '../controllers/domains';
import check from '../controllers/check';

const router = express.Router();

router.route('/')
	/**
	* @api {post} /api/domains Add custom domain
	* @apiName AddCustomDomain
	* @apiGroup Domains
	* @apiVersion 0.0.1
	*
	* @apiParam {String} id          Project id.
	* @apiParam {String} domain      Domain name <code>sub.example.com</code>.
	*
	* @apiParamExample {json} Request-Example:
	*     {
	*		   "id": "f74f3h7hfuifdwjr389"
	*          "domain": "sub.example.com",
	*     }
	*
	* @apiSuccess (200) {String} success              Success message <code>true</code>.
	* @apiSuccess (200) {Object} data                Data object.
	* @apiSuccess (200) {String} data.name          GitHub repo name.
	* @apiSuccess (200) {String} data.private          <code>private/public</code>.
	* @apiSuccess (200) {String} data.git_url        GitHub repo ssh url.
	* @apiSuccess (200) {String} data.clone_url        GitHub repo https url.
	* @apiSuccess (200) {String} data.location          GitHub repo url.
	* @apiSuccess (200) {String} data.status          GitHub repo creation status.
	* @apiSuccess (200) {Object} data.branch            Branch object.
	* @apiSuccess (200) {String} data.branch.message        Message from GitHub API.
	* @apiSuccess (200) {String} data.branch.repo_url    GitHub repo https url.
	*
	* @apiSuccessExample {json} Success-Response:
	*  HTTP/1.1 200 OK
	*  {
	*	  "success": true,
	*	  "data": {
	*	    "name": "vavandr",
	*	    "private": false,
	*	    "git_url": "git://github.com/grigorkh/vavandr.git",
	*	    "clone_url": "https://github.com/grigorkh/vavandr.git",
	*	    "location": "https://api.github.com/repos/grigorkh/vavandr",
	*	    "status": "201 Created",
	*	    "branch": {
	*	      "message": "rodin_editor branch successfuly created",
	*	      "repo_url": "https://github.com/grigorkh/vavandr.git"
	*	    }
	*	  }
	*	}
	*
	* @apiError NoGithub GitHub account not linked to this user!
	*
	* @apiErrorExample {json} Bad Request:
	*      HTTP/1.1 350
	*      {
	*          "success": false
	*          "error": {
	*              "message": "GitHub account not linked to this user!",
	*              "status": 350,
	*              "timestamp": 1473863313415
	*          }
	*      }
	*
	* @apiError NoToken Token does not provided!
	*
	* @apiErrorExample {json} Bad Request:
	*      HTTP/1.1 315
	*      {
	*          "success": false
	*          "error": {
	*              "message": "Token does not provided!",
	*              "status": 315,
	*              "timestamp": 1480923413253
	*          }
	*      }
	*
	*/
	.post(check.ifTokenValid, domainsCtrl.add);

export default router;
