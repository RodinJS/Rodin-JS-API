/**
 * Created by Reinchard on 7/12/2017.
 */
import express from 'express';
const router = express.Router();	// eslint-disable-line new-cap
import blogSubscribeCtrl from '../controllers/blog';

router.route('/subscribe')
  .post(blogSubscribeCtrl.subscribe);

export default router;
