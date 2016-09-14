import express from 'express';
import config from '../../config/env';
import socketCtrl from '../controllers/socket';

const router = express.Router();	// eslint-disable-line new-cap

/** POST /socket/connect - Returns token if correct username and password is provided */
router.route('/connect')
  .post(socketCtrl.connect); //TODO make token for users

export default router;
