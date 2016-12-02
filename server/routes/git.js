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
	*
	* @apiParamExample {json} Request-Example:
	*     {
	*          "root": "projectForGit",
	*          "name": "s0meRepoName"
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
	*     HTTP/1.1 200 OK
	*     {
	*          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdhZm95dHQiLCJyb2",
	*          "user": {
	*              "email": "user@example.com",
	*              "role": "Free"
	*              "profile": {
	*                  "firstName": "Gago"
	*                  "lastName": "Aperikyan"
	*              }
	*           }
	*     }
	*
	* @apiError BadRequest <code>email</code> and/or <code>password</code> of the User is required.
	*
	* @apiErrorExample {json} Bad Request:
	*      HTTP/1.1 400 Bad Request
	*      {
	*          "success": false
	*          "error": {
	*              "message": "\"email\" is required and \"password\" is required",
	*              "status": 400,
	*              "type": "Bad Request",
	*              "timestamp": 1473863313415
	*          }
	*      }
	*
	* @apiError UserExists User exists.
	*
	* @apiErrorExample {json} Bad Request:
	*      HTTP/1.1 400 Bad Request
	*      {
	*          "success": false
	*          "error": {
	*              "message": "User exists",
	*              "status": 400,
	*              "type": "Bad Request",
	*              "timestamp": 1474029303546
	*          }
	*      }
	*
	*/
	.post(check.ifTokenValid, gitCtrl.create);

export default router;
