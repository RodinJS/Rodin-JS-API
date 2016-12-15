/**
 * Created by xgharibyan on 11/3/16.
 */

import express from 'express';
import check from '../controllers/check';
import config from '../../config/env';
import stripeCtrl from '../controllers/payments/stripe';

const router = express.Router();

router.route('/stripe/plan')
    .get(check.isGod,  stripeCtrl.getPlan)
    .post(check.isGod, stripeCtrl.createPlan)
    .delete(check.isGod, stripeCtrl.removePlan);

router.route('/stripe/customer')
    .get(check.ifTokenValid, stripeCtrl.getCustomer)
    .put(check.ifTokenValid, stripeCtrl.updateCustomer)
    .post(check.ifTokenValid, stripeCtrl.createCustomer, stripeCtrl.updateUser);

router.route('/stripe/card')
    .post(check.ifTokenValid, stripeCtrl.createCard)
    .delete(check.ifTokenValid, stripeCtrl.deleteCard);

router.route('/stripe/subscription')
    .post(check.ifTokenValid, stripeCtrl.createSubscription, stripeCtrl.updateUser)
    .put(check.ifTokenValid, stripeCtrl.updateSubscription, stripeCtrl.updateUser)
    .get(check.ifTokenValid,  stripeCtrl.getSubscription)
    .delete(check.ifTokenValid,  stripeCtrl.deleteSubscription, stripeCtrl.updateUser);

export default router;