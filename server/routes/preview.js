import express from 'express';
import previewCtrl from '../controllers/preview';

const router = express.Router();	// eslint-disable-line new-cap

/**
 * @api {get} /preview/:username/:projectId Project preview
 * @apiName PreviewProject
 * @apiGroup Preview
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
router.route('/:user/:project')
  .get(previewCtrl.get);



export default router;
