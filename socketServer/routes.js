import express from 'express';
import hooksCtrl from './hooksCtrl';

const router = express.Router();	// eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.post('/hooks', hooksCtrl.push);

export default router;
