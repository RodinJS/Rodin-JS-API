import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth';
import check from '../controllers/check';
import config from '../../config/env';

import passport from '../../config/passport';

const router = express.Router();	// eslint-disable-line new-cap

// const requireAuth = passport.authenticate('jwt', { session: false }); // eslint-disable-line

/**
 * @api {post} /api/auth/login Login
 * @apiName LoginUser
 * @apiGroup Auth
 * @apiVersion 0.0.1
 *
 * @apiParam {String} email        User email.
 * @apiParam {String} password     User password.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *          "email": "user@example.com",
 *          "password": "s0meStr0ngPassw0rd!"
 *     }
 *
 * @apiSuccess (200) {String}  token Server side generated token.
 * @apiSuccess (200) {Object}  user  User information.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdhbW9AZXhhbXBsZS5jb20iLCJyb2xlIjoiRnJlZSIsImlhdCI6MTQ3Mzg3NTczNywiZXhwIjoxNDc0NDgwNTM3fQ.WaTNyLUH5PuDZ9zPfBjmfllphmONEJSJQHeh1mELAhs",
 *         "user": {
 *             "email": "gamo@example.com",
 *             "role": "Free",
 *             "profile": {
 *                 "lastName": "Vardanushyan",
 *                 "firstName": "Gago"
 *              }
 *          }
 *      }
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
 */
router.route('/login')
	.post(validate(paramValidation.login), authCtrl.login, authCtrl.finalizeUser);

/**
 * @api {post} /api/auth/verify Verify token
 * @apiName VerifyToken
 * @apiGroup Auth
 * @apiVersion 0.0.1
 *
 * @apiParam {String} token User <code>token</code>.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdhbW9AZXhhbXBsZS5jb20iLCJyb2xlIjoiRnJlZSIsImlhdCI6MTQ3Mzg3NTczNywiZXhwIjoxNDc0NDgwNTM3fQ.WaTNyLUH5PuDZ9zPfBjmfllphmONEJSJQHeh1mELAhs",
 *     }
 *
 * @apiSuccess (200) {String} success <code>true</code>.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *     }
 *
 * @apiError BadRequest <code>email</code> and/or <code>password</code> of the User is required.
 *
 * @apiErrorExample {json} Bad Request:
 *      HTTP/1.1 400 Bad Request
 *      {
 *          "name": "Error"
 *          "status": 400
 *          "isPublic": true
 *          "isOperational": true
 *      }
 */
router.route('/verify')
	.post(authCtrl.verify);




/**
 * @api {post} /api/auth/verify/email Verify if email exists
 * @apiName VerifyIfEmailExists
 * @apiGroup Auth
 * @apiVersion 0.0.1
 *
 * @apiParam {String} email User <code>email</code>.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *          "email": "gago@mail.ru",
 *     }
 *
 * @apiSuccess (200) {String} success <code>true</code>.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *     }
 *
 * @apiError BadRequest <code>email</code> is required.
 *
 * @apiErrorExample {json} Bad Request:
 *      HTTP/1.1 400 Bad Request
 *      {
 *          "name": "Error"
 *          "status": 400
 *          "isPublic": true
 *          "isOperational": true
 *      }
 */
// router.route('/verify/email')
// 	.post(check.ifEmailExists);

/**
 * @api {post} /api/auth/logout Logout
 * @apiName Logout
 * @apiGroup Auth
 * @apiVersion 0.0.1
 *
 * @apiParam {String} token User's <code>token</code>.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdhbW9AZXhhbXBsZS5jb20iLCJyb2xlIjoiRnJlZSIsImlhdCI6MTQ3Mzg3NTczNywiZXhwIjoxNDc0NDgwNTM3fQ.WaTNyLUH5PuDZ9zPfBjmfllphmONEJSJQHeh1mELAhs",
 *     }
 *
 * @apiSuccess (200) {String} success <code>true</code>.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *     }
 *
 */
router.route('/logout')
	.post(authCtrl.logout);



router.route('/social/:socialName')
	.post(authCtrl.socialAuth, authCtrl.finalizeUser);

router.route('/preSignUp')
	.post(authCtrl.preSignUp)


/*router.route('/steam')
	.get(passport.authenticate("steam"));

router.route('/steam/callback')
	.get(passport.authenticate('steam', {failureRedirect: '/login'}));*/



/**
 *
 */
router.route('/invitationCode')
    /**
     *
     */
	.post(authCtrl.generateInvitationCode)
    /**
     *
     */
	.delete(authCtrl.removeInvitationCode);

export default router;