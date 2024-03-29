import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import projectCtrl from '../controllers/project';
import check from '../controllers/check';
import buildRouter from './build/index';
import downloadRouter from './download';

const router = express.Router();	// eslint-disable-line new-cap

// const requireAuth = passport.authenticate('jwt', { session: false }); // eslint-disable-line

router.route('/')
/**
 * @api {get} /api/project Get list of projects
 * @apiName GetAllProjects
 * @apiGroup Project
 * @apiVersion 0.0.1
 *
 * @apiParam {String} token User token to verify if project have permissions.
 *
 * @apiParamExample {json} Request-Example:
 *     {
	*          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9JeyJlbWFpbCI6ImdhbW9Ahs",
	*     }
 *
 * @apiSuccess (200) {Object[]} project          Aray of projects
 * @apiSuccess (200) {Number} project._id          Project <code>_id</code>
 * @apiSuccess (200) {String} project.name        Project <code>name</code>
 * @apiSuccess (200) {Array} project.tags        Project <code>tags</code>
 * @apiSuccess (200) {String} project.description          Project <code>description</code>
 * @apiSuccess (200) {String} project.createdAt      Project creation date and time <code>createdAt</code>
 * @apiSuccess (200) {String} project.updatedAt      Project update date and time <code>updatedAt</code>
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
 *      {
	*		    "_id": "57d98ef96f22c63674d42f3c",
	*		    "email": "gamo@example.com",
	*		    "password": "$2a$05$eWanEGb5rTCpJJpBTtwPv.d5auESpxUYnnF3UU5U2VHGubDEP0J2u",
	*		    "__v": 0,
	*		    "createdAt": "2016-09-14T17:55:05.753Z",
	*		    "profile": {
	*		      "firstName": "Gago",
	*		      "lastName": "Vardanushyan"
	*		    },
	*		    "role": "Free"
	*		  },
 *      {
	*		    "_id": "57d8172df0c12301b0785b01",
	*		    "email": "aram",
	*		    "password": "$2a$05$295gPpoVWpOlBld3BgQTVOca4Amr8.TDkbbzN7Qla5NaY/XIlAnAS",
	*		    "__v": 0,
	*		    "createdAt": "2016-09-13T15:11:41.377Z",
	*		    "profile": {
	*		      "firstName": "Aram",
	*		      "lastName": "Arzumanyan"
	*		    },
	*		    "role": "Free"
	*		  }
 *    ]
 *
 * @apiError Unauthorized You need to be Admin to get this info. TODO: Handle this
 *
 * @apiErrorExample {json} Unauthorized:
 *      HTTP/1.1 401 Unauthorized
 *      {
	*          "success": false
	*          "error": {
	*              "message": "You need to be Admin to get this info",
	*              "status": 401,
	*              "type": "Unauthorized",
	*              "timestamp": 1473863313415
	*          }
	*      }
 */
  .get(check.ifTokenValid, projectCtrl.list)

  /**
   * @api {post} /api/project Create new project
   * @apiName CreateProject
   * @apiGroup Project
   * @apiVersion 0.0.1
   *
   * @apiParam {String} name            Project name.
   * @apiParam {String} description    Project description.
   * @apiParam {String} tags          Array of meta tags.
   *
   * @apiParamExample {json} Request-Example:
   *     {
	*          "name": "project",
	*          "description": "s0meDescription!",
	*          "tags": "s0metags1!",
	*          "tags": "s0metags2!",
	*     }
   *
   * @apiSuccess (200) {String} token                    Server side generated token.
   * @apiSuccess (200) {Object} project                  User info object.
   * @apiSuccess (200) {String} project.email            User email.
   * @apiSuccess (200) {String} project.role              User role.
   * @apiSuccess (200) {Object} project.profile          User profile info.
   * @apiSuccess (200) {String} project.profile.firstName  User first name.
   * @apiSuccess (200) {String} project.profile.lastName  User last name.
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
	*			"success": true,
	*			"data": {
	*				"_id": "584161219c55c72e38380973",
	*				"name": "testProject",
	*				"owner": "s0meOwner",
	*				"root": "testproject"
	*			}
	*		}
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
  .post(check.ifTokenValid, validate(paramValidation.createProject), projectCtrl.getProjectsCount, projectCtrl.create);

router.route('/count')
  .get(projectCtrl.getAllProjectsCount);

router.route('/:id')
/**
 * @api {get} /api/project/:projectId Get single project
 * @apiName GetProject
 * @apiGroup Project
 * @apiVersion 0.0.1
 *
 * @apiParam {String} username User username.
 * @apiParam {String} token Admin token for checking permissions.
 *
 * @apiParamExample {json} Request-Example:
 *     {
	 *          "username": "project@example.com",
	 *          "x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9JeyJlbWFpbCI6ImdhbW9Ahs"
	 *     }
 *
 * @apiSuccess (200) {String}  success  Success: <code>true</code>.
 * @apiSuccess (200) {Object}  project    User info Object <code>{...}</code>.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
	 *          "success": true,
	 *          "project": {
	 *		        "_id": "57d98ef96f22c63674d42f3c",
	 *		        "email": "project@example.com",
	 *		        "password": "$2a$05$eWanEGb5rTCpJJpBTtwPv.d5auESpxUYnnF3UU5U2VHGubDEP0J2u",
	 *		        "__v": 0,
	 *		        "createdAt": "2016-09-14T17:55:05.753Z",
	 *		        "profile": {
	 *		            "firstName": "Gago",
	 *		            "lastName": "Vardanushyan"
	 *		        },
	 *		        "role": "Free"
	 *          }
	 *     }
 *
 * @apiError BadRequest <code>username</code> of the User is incorect.
 *
 * @apiErrorExample {json} Bad Request:
 *      HTTP/1.1 400 Bad Request
 *      {
	 *          "success": false
	 *          "error": {
	 *              "message": "Wrong username",
	 *              "status": 400,
	 *              "type": "Bad Request",
	 *              "timestamp": 1473863313415
	 *          }
	 *      }
 *
 * @apiError Unauthorised You need to be Admin to get this info. TODO: Handle this
 *
 * @apiErrorExample {json} Forbidden:
 *      HTTP/1.1 403 Forbidden
 *      {
	 *          "success": false
	 *          "error": {
	 *              "message": "You have not enough permissions to get this info"
	 *              "status": 403
	 *              "type": "Forbidden"
	 *              "timestamp": 1473756023136
	 *          }
	 *      }
 */
  .get(check.ifTokenValid, projectCtrl.get, projectCtrl.getProjectSize, projectCtrl.finalize)

  /** PUT /api/project/:projectId - Update project */
  .put(check.ifTokenValid, validate(paramValidation.updateProject), projectCtrl.update)

  /**
   * @api {delete} /api/project/:projectId Delete single project
   * @apiName DeleteProject
   * @apiGroup Project
   * @apiVersion 0.0.1
   *
   * @apiParam {String} username User username.
   * @apiParam {String} token Admin token for checking permissions.
   *
   * @apiParamExample {json} Request-Example:
   *     {
	 *          "username": "project@example.com",
	 *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9JeyJlbWFpbCI6ImdhbW9Ahs"
	 *     }
   *
   * @apiSuccess (200) {String}  success  Success: <code>true</code>.
   * @apiSuccess (200) {Object}  project    Deleted project info: Object <code>{...}</code>.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
	 *          "success": true,
	 *          "project": {
	 *		        "_id": "57d98ef96f22c63674d42f3c",
	 *		        "email": "project@example.com",
	 *		        "password": "$2a$05$eWanEGb5rTCpJJpBTtwPv.d5auESpxUYnnF3UU5U2VHGubDEP0J2u",
	 *		        "__v": 0,
	 *		        "createdAt": "2016-09-14T17:55:05.753Z",
	 *		        "profile": {
	 *		            "firstName": "Gago",
	 *		            "lastName": "Vardanushyan"
	 *		        },
	 *		        "role": "Free"
	 *          }
	 *     }
   *
   * @apiError BadRequest <code>email</code> of the User is incorect.
   *
   * @apiErrorExample {json} Bad Request:
   *      HTTP/1.1 400 Bad Request
   *      {
	 *          "success": false
	 *          "error": {
	 *              "message": "Wrong email address",
	 *              "status": 400,
	 *              "type": "Bad Request",
	 *              "timestamp": 1473863313415
	 *          }
	 *      }
   *
   * @apiError Unauthorised You need to be Admin to get this info. TODO: Handle this
   *
   * @apiErrorExample {json} Unauthorised:
   *      HTTP/1.1 401 Unauthorised
   *      {
	 *          "success": false
	 *          "error": {
	 *              "message": "You need to be Admin to get this info"
	 *              "status": 401
	 *              "type": "Authorisation Error"
	 *              "timestamp": 1473756023136
	 *          }
	 *      }
   */
  .delete(check.ifTokenValid, projectCtrl.get, projectCtrl.remove);

router.route('/publish/rollback/:id')
  .post(check.ifTokenValid, check.project, projectCtrl.rollBack);

router.route('/publish/:id')
  .get(check.ifTokenValid, check.project, projectCtrl.getPublishedHistory)
  .post(check.ifTokenValid, check.project, projectCtrl.publishProject)
  .put(check.ifTokenValid, check.project, projectCtrl.rePublishProject)
  .delete(check.ifTokenValid, check.project, projectCtrl.unPublishProject);

router.route('/published/list')
  .get(projectCtrl.getPublishedProjects);

router.route('/published/:id')
  .get(projectCtrl.getPublishedProject);


/**
 * templates
 */
router.route('/templates/importOnce')
  .get(projectCtrl.importOnce);

/**
 *
 */
router.route('/templates/list')
  .get(check.ifTokenValid, projectCtrl.getTemplatesList);

router.route('/:id/build/transpile')
  .get(check.ifTokenValid, check.isProjectOwn, projectCtrl.transpile);

router.use('/:id/build', check.ifTokenValid, check.isProjectOwn, buildRouter);
router.use('/:id/download', check.ifTokenValid, check.isProjectOwn, downloadRouter);

router.route('/pp/:id')
  .post(check.ifTokenValid, projectCtrl.get, projectCtrl.makePublic, downloadRouter);

export default router;
