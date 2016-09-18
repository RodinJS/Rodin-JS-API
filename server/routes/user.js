import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user';
import '../../config/passport';
import passport from 'passport';

const router = express.Router();	// eslint-disable-line new-cap

const requireAuth = passport.authenticate('jwt', { session: false }); // eslint-disable-line

router.route('/')
	/**
	 * @api {get} /api/user Get list of users
	 * @apiName GetAllUsers
 	 * @apiGroup User
 	 * @apiVersion 0.0.1
 	 *
	 * @apiParam {String} token User token to verify if user have permissions.
	 *
	 * @apiParamExample {json} Request-Example:
	 *     {
	 *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9JeyJlbWFpbCI6ImdhbW9Ahs",
	 *     }
	 *
	 * @apiSuccess (200) {Object[]} user 					Aray of user profiles
	 * @apiSuccess (200) {Number} user._id 					Users <code>_id</code> 
	 * @apiSuccess (200) {String} user.email 				Users <code>email</code> 
	 * @apiSuccess (200) {String} user.password				Users <code>password</code> bcrypted 
	 * @apiSuccess (200) {String} user.role					Users <code>role</code> 
	 * @apiSuccess (200) {String} user.createdAt			Users profile creation date and time 
	 * @apiSuccess (200) {String} user.profile				Users additional information 
	 * @apiSuccess (200) {String} user.profile.firstName	Users <code>firstName</code> 
	 * @apiSuccess (200) {String} user.profile.lastName		Users <code>lastName</code> 
	 *
	 * @apiSuccessExample {json} Success-Response:
	 *     HTTP/1.1 200 OK
	 *		[
	 *		  {
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
	 *		  {
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
	 *		]
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
	.get(requireAuth, userCtrl.list)

	/**
	 * @api {post} /api/user Create new user
	 * @apiName CreateUser
 	 * @apiGroup User
 	 * @apiVersion 0.0.1
 	 *
	 * @apiParam {String} email        User email.
	 * @apiParam {String} password     User password.
	 * @apiParam {String} [firstname]  Firstname of the User.
	 * @apiParam {String} [lastname]   Lastname of the User.
	 *
	 * @apiParamExample {json} Request-Example:
	 *     {
	 *          "email": "user@example.com",
	 *          "password": "s0meStr0ngPassw0rd!"
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
	.post(validate(paramValidation.createUser), userCtrl.create);

router.route('/:userEmail')
	/**
	 * @api {get} /api/user/:userEmail Get single user
	 * @apiName GetUser
 	 * @apiGroup User
 	 * @apiVersion 0.0.1
 	 *
	 * @apiParam {String} email User email.
	 * @apiParam {String} token Admin token for checking permissions.
	 *
	 * @apiParamExample {json} Request-Example:
	 *     {
	 *          "email": "user@example.com",
	 *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9JeyJlbWFpbCI6ImdhbW9Ahs"
	 *     }
	 *
	 * @apiSuccess (200) {String}  success 	Success: <code>true</code>.
	 * @apiSuccess (200) {Object}  user		User info Object <code>{...}</code>.
	 *
	 * @apiSuccessExample {json} Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *          "success": true,
	 *          "user": {
	 *		        "_id": "57d98ef96f22c63674d42f3c",
	 *		        "email": "user@example.com",
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
	.get(requireAuth, userCtrl.get)

	/** PUT /api/user/:userId - Update user */
	.put(requireAuth, validate(paramValidation.updateUser), userCtrl.update)

	/**
	 * @api {delete} /api/user/:userEmail Delete single user
	 * @apiName DeleteUser
 	 * @apiGroup User
 	 * @apiVersion 0.0.1
 	 *
	 * @apiParam {String} email User email.
	 * @apiParam {String} token Admin token for checking permissions.
	 *
	 * @apiParamExample {json} Request-Example:
	 *     {
	 *          "email": "user@example.com",
	 *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9JeyJlbWFpbCI6ImdhbW9Ahs"
	 *     }
	 *
	 * @apiSuccess (200) {String}  success 	Success: <code>true</code>.
	 * @apiSuccess (200) {Object}  user		Deleted user info: Object <code>{...}</code>.
	 *
	 * @apiSuccessExample {json} Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *          "success": true,
	 *          "user": {
	 *		        "_id": "57d98ef96f22c63674d42f3c",
	 *		        "email": "user@example.com",
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
	.delete(requireAuth, userCtrl.remove);

/** Load user when API with userId route parameter is hit */
router.param('userEmail', userCtrl.load);

export default router;
