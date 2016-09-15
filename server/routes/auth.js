import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth';
import config from '../../config/env';
import '../../config/passport';
import passport from 'passport';

const router = express.Router();	// eslint-disable-line new-cap

const requireAuth = passport.authenticate('jwt', { session: false }); // eslint-disable-line
/** POST /api/auth/login - Returns token if correct username and password is provided */
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
  .post(validate(paramValidation.login), authCtrl.login);

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/random-number')
  .get(requireAuth, authCtrl.getRandomNumber);
  // .get(expressJwt({ secret: config.jwtSecret }), authCtrl.getRandomNumber);
  
export default router;
