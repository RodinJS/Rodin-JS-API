import express from 'express';
import config from '../../config/env';
import socketCtrl from '../controllers/socket';

const router = express.Router();	// eslint-disable-line new-cap

/**
 * @api {post} /socket/connect Get token for Socket server
 * @apiName Connect
	 * @apiGroup Socket
	 * @apiVersion 0.0.1
	 *
 * @apiParam {String} token Valid server side generated token.
 *
 *
 * @apiSuccess (200) {String}  success 			Success: <code>true</code>.
 * @apiSuccess (200) {Object}  data				Object with required information.
 * @apiSuccess (200) {Object}  data.user		Object with user required information.
 * @apiSuccess (200) {String}  data.user.token	Token for connecting to socket server.
 * @apiSuccess (200) {String}  data.user.stream	Credentials for connecting to OpenTok server.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *       {
 *           "success": true,
 *           "data": {
 *               "user": {
 *                   "token": "19044bf6-b016-578c-4b04-1f96d9f9",
 *                   "stream": {
 *                       "sessionId": "1_MX40NTYyNDI0Mn5-MTQ3Mzg1ODQ5OTE2NH44T3JrSXNkT1JCREhsdjdJTDM3M1ZCckV-UH4",
 *                       "token": "T1==cGFydG5lcl9pZD00NTYyNDI0MiZzaWc9ZTdjYjFiNmY2ODE3OWY0N2VjZjFlYzQ3NWRlMjRiNWIwZDUyNGExZTpzZXNzaW9uX2lkPTFfTVg0ME5UWXlOREkwTW41LU1UUTNNemcxT0RRNU9URTJOSDQ0VDNKclNYTmtUMUpDUkVoc2RqZEpURE0zTTFaQ2NrVi1VSDQmY3JlYXRlX3RpbWU9MTQ3Mzg4Mzc2NyZub25jZT0wLjczNTk1ODYwMzI4MzY0ODcmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTQ3NDQ4ODU2NyZjb25uZWN0aW9uX2RhdGE9dG9rZW4lM0QxOTA0NGJmNi1iMDE2LTU3OGMtNGIwNC0xZjk2ZDlmOQ=="
 *                   },
 *                   "last_action": 1473883766705,
 *                   "appId": "358b43a076ed7dc0"
 *               },
 *           "token": "19044bf6-b016-578c-4b04-1f96d9f9"
 *           }
 *      }
 *
 * @apiError InvalidAppIdOrSecret Invalid appId or appSecret for Socket server.
 *
 * @apiErrorExample {json} Unauthorised:
 *      HTTP/1.1 401 Unauthorised
 *      {
 *          "success": false
 *          "error": {
 *              "message": "Invalid appId or appSecret"
 *              "status": 401
 *              "timestamp": 1473756023136
 *              "type": "Authorisation Error"
 *          }
 *      }
 *
 * @apiError InvalidRequestData Invalid request data. Check api documentation.
 *
 * @apiErrorExample {json} Bad Request:
 *      HTTP/1.1 400 Bad Request
 *      {
 *          "success": false
 *          "error": {
 *              "message": "Invalid request data. Check api documentation"
 *              "status": 400
 *              "timestamp": 1473756023136
 *              "type": "Bad Request"
 *          }
 *      }
 */
router.route('/connect')
  .post(socketCtrl.connect); //TODO make token for users

export default router;
