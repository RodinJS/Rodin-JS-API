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

export default router;
