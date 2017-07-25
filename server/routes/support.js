/**
 * Created by xgharibyan on 11/3/16.
 */

import express from 'express';
import supportCtrl from '../controllers/support';
import check from '../controllers/check';

const router = express.Router();

router.route('/:type')
  .get(supportCtrl.getQuestionsList)
  .post(check.ifTokenValid, supportCtrl.validateCustomer, supportCtrl.createQuestion);

router.route('/thread/:conversationId')
  .post(check.ifTokenValid, supportCtrl.validateCustomer, supportCtrl.createQuestionThread);

router.route('/conversation/:type/:id')
  .get(supportCtrl.getConversation)
  .put(check.ifTokenValid, supportCtrl.updateConversation);

router.route('/tags/:type')
  .get(supportCtrl.getTags);

router.route('/search/:type')
  .get(supportCtrl.searchConversations);


export default router;
