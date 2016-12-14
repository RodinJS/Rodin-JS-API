import express from 'express';
import gitCtrl from '../controllers/git';
import check from '../controllers/check';

const router = express.Router();

router.route('/')
	/**
	* @api {post} /api/git Create new GitHub repo
	* @apiName CreateGitRepo
	* @apiGroup Git
	* @apiVersion 0.0.1
	*
	* @apiParam {String} root        Project root folder path.
	* @apiParam {String} name        GitHub repo name.
	* @apiParam {String} id        	 Project id.
	*
	* @apiParamExample {json} Request-Example:
	*     {
	*          "root": "projectForGit",
	*          "name": "s0meRepoName",
	*		   "id": "f74f3h7hfuifdwjr389"
	*     }
	*
	* @apiSuccess (200) {String} token        				Server side generated token.
	* @apiSuccess (200) {Object} user         				User info object.
	* @apiSuccess (200) {String} user.email   				User email.
	* @apiSuccess (200) {String} user.role    				User role.
	* @apiSuccess (200) {Object} user.profile 				User profile info.
	* @apiSuccess (200) {String} user.profile.firstName	User first name.
	* @apiSuccess (200) {String} user.profile.lastName     User last name.
	*
	* @apiSuccessExample {json} Success-Response:
	*	HTTP/1.1 200 OK
	*	{
	*		"success": true,
	*		"data": {
	*			"name": "vavandr",
	*			"private": false,
	*			"git_url": "git://github.com/grigorkh/vavandr.git",
	*			"clone_url": "https://github.com/grigorkh/vavandr.git",
	*			"location": "https://api.github.com/repos/grigorkh/vavandr",
	*			"status": "201 Created"
	*		}
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
	.post(check.ifTokenValid, gitCtrl.create);
	
router.route('/branch')
	/**
	* @api {post} /api/git/branch Create new GitHub branch
	* @apiName CreateGitBranch
	* @apiGroup Git
	* @apiVersion 0.0.1
	*
	* @apiParam {String} root        Project root folder path.
	* @apiParam {String} name        GitHub repo name.
	* @apiParam {String} branch    	 GitHub repo branch name.
	* @apiParam {String} id        	 Project id.
	*
	* @apiParamExample {json} Request-Example:
	*     {
	*          "root": "projectForGit",
	*          "name": "s0meRepoName",
	*		   "branch": "someBranch",
	*		   "id": "f74f3h7hfuifdwjr389"
	*     }
	*
	* @apiSuccess (200) {Boolean} success      				Success message <code>true</code>.
	* @apiSuccess (200) {Object} data         				Data object.
	* @apiSuccess (200) {String} data.message 				Data message.
	* @apiSuccess (200) {String} data.repo_url 				GitHub repo url.
	*
	* @apiSuccessExample {json} Success-Response:
	*	HTTP/1.1 200 OK
	*	{
	*	  "success": true,
	*	  "data": {
	*	    "message": "gagoz branch successfuly created",
	*	    "repo_url": "https://github.com/grigorkh/vavandr.git"
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
	.post(check.ifTokenValid, gitCtrl.branch);

router.route('/theirs')
	/**
	* @api {post} /api/git/branch Create new GitHub branch
	* @apiName CreateGitBranch
	* @apiGroup Git
	* @apiVersion 0.0.1
	*
	* @apiParam {String} root        Project root folder path.
	* @apiParam {String} name        GitHub repo name.
	* @apiParam {String} branch    	 GitHub repo branch name.
	* @apiParam {String} id        	 Project id.
	*
	* @apiParamExample {json} Request-Example:
	*     {
	*          "root": "projectForGit",
	*          "name": "s0meRepoName",
	*		   "branch": "someBranch",
	*		   "id": "f74f3h7hfuifdwjr389"
	*     }
	*
	* @apiSuccess (200) {Boolean} success      				Success message <code>true</code>.
	* @apiSuccess (200) {Object} data         				Data object.
	* @apiSuccess (200) {String} data.message 				Data message.
	* @apiSuccess (200) {String} data.repo_url 				GitHub repo url.
	*
	* @apiSuccessExample {json} Success-Response:
	*	HTTP/1.1 200 OK
	*	{
	*	  "success": true,
	*	  "data": {
	*	    "message": "gagoz branch successfuly created",
	*	    "repo_url": "https://github.com/grigorkh/vavandr.git"
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
	.post(check.ifTokenValid, gitCtrl.theirs);

router.route('/ours')
	/**
	* @api {post} /api/git/branch Create new GitHub branch
	* @apiName CreateGitBranch
	* @apiGroup Git
	* @apiVersion 0.0.1
	*
	* @apiParam {String} root        Project root folder path.
	* @apiParam {String} name        GitHub repo name.
	* @apiParam {String} branch    	 GitHub repo branch name.
	* @apiParam {String} id        	 Project id.
	*
	* @apiParamExample {json} Request-Example:
	*     {
	*          "root": "projectForGit",
	*          "name": "s0meRepoName",
	*		   "branch": "someBranch",
	*		   "id": "f74f3h7hfuifdwjr389"
	*     }
	*
	* @apiSuccess (200) {Boolean} success      				Success message <code>true</code>.
	* @apiSuccess (200) {Object} data         				Data object.
	* @apiSuccess (200) {String} data.message 				Data message.
	* @apiSuccess (200) {String} data.repo_url 				GitHub repo url.
	*
	* @apiSuccessExample {json} Success-Response:
	*	HTTP/1.1 200 OK
	*	{
	*	  "success": true,
	*	  "data": {
	*	    "message": "gagoz branch successfuly created",
	*	    "repo_url": "https://github.com/grigorkh/vavandr.git"
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
	.post(check.ifTokenValid, gitCtrl.ours);

export default router;
