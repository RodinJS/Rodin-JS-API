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
	* @apiSuccess (200) {String} success             Success message <code>true</code>.
	* @apiSuccess (200) {Object} data                Data object.
	* @apiSuccess (200) {String} data.message        Success message.
	*
	* @apiSuccessExample {json} Success-Response:
	*  HTTP/2 200 OK
	*  {
	*	  "success": true,
	*	  "data": {
	*	    "message": "t2.rodin.design domain name added to project successfuly!"
	*	  }
	*	}
	*
	* @apiError NoGithub GitHub account not linked to this user!
	*
	* @apiErrorExample {json} Bad Request:
	*      HTTP/2 360
	*		{
	*			"success": false,
	*			"error": {
	*				"message": "Domain name does not provided!",
	*				"status": 360,
	*				"timestamp": 1482410469168
	*			}
	*		}
	*
	* @apiError NoToken Token does not provided!
	*
	* @apiErrorExample {json} Bad Request:
	*      HTTP/2 328
	*		{
	*			"success": false,
	*			"error": {
	*				"message": "Project id does not provided!",
	*				"status": 328,
	*				"timestamp": 1482410651163
	*			}
	*		}	
	*
	* @apiError NoToken Token does not provided!
	*
	* @apiErrorExample {json} Bad Request:
	*      HTTP/2 666
	*		{
	*		  "success": false,
	*		  "error": {
	*		    "message": "No project with ${id} id!",
	*		    "status": 666,
	*		    "timestamp": 1482410969774
	*		  }
	*		}
	*
	*/
	.post(check.ifTokenValid, domainsCtrl.add);

export default router;
