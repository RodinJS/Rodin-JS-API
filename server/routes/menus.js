/**
 * Created by Reinchard on 8/15/2017.
 */


import express from 'express';
import menusCtrl from '../controllers/menus';

const router = express.Router();

router.route('/')
  .get(menusCtrl.list);


export default router;
