/**
 * Created by xgharibyan on 11/3/16.
 */

import express from 'express';
import pagesCtrl from '../controllers/pages';

const router = express.Router();

router.route('/')
  .get(pagesCtrl.list);

router.route('/:url')
  .get(pagesCtrl.getByUrl);

router.route('/support/faq')
  .get(pagesCtrl.getFaq)

export default router;
