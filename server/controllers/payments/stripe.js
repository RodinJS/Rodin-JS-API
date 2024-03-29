import _ from 'lodash';
import config from '../../../config/env';
import APIError from '../../helpers/APIError';
import httpStatus from '../../helpers/httpStatus';
import User from '../../models/user';
const stripeKeys = config.payments.tokens.stripe;
const stripe = require('stripe')(stripeKeys.secret);

function createPlan(req, res, next) {

    if (_.isUndefined(req.body.planId)) {
        const err = new APIError('Provide planId! Unique identificator', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (_.isUndefined(req.body.amount)) {
        const err = new APIError('Provide amount!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (_.isUndefined(req.body.currency)) {
        const err = new APIError('Provide currency! 3-letter ISO code for currency.', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (_.isUndefined(req.body.interval)) {
        const err = new APIError('Provide interval! week, month or year', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (_.isUndefined(req.body.planName)) {
        const err = new APIError('Provide name!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const params = {
        amount: req.body.amount,
        interval: req.body.interval,
        name: req.body.planName,
        currency: req.body.currency,
        id: req.body.planId,
    };

    stripe.plans.create(params, (err, plan) => {
        if (err) {
            const err = new APIError('Plan creation error!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        res.status(200).json({ success: true, data: plan });
    });
}

function getPlan(req, res, next) {
    const planId = req.query.id;

    if (planId) {
        stripe.plans.retrieve(planId, (err, plan)=> {
            if (err) {
                const err = new APIError('Wrong plan id!', httpStatus.BAD_REQUEST, true);
                return next(err);
            }

            res.status(200).json({ success: true, data: plan });
        });
    } else {
        stripe.plans.list({}, (err, plan)=> {
            if (err) {
                const err = new APIError('Plan get error!', httpStatus.BAD_REQUEST, true);
                return next(err);
            }

            res.status(200).json({ success: true, data: plan.data });
        });
    }

}

function removePlan(req, res, next) {

    if (!req.query.id) {
        const err = new APIError('Provide plan id!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    stripe.plans.del(req.query.id, (err, plan)=> {
        if (err) {
            const err = new APIError('Wrong plan id!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        res.status(200).json({ success: true, data: plan });
    });
}

function createCustomer(req, res, next) {
    if (_.isUndefined(req.body.stripeToken)) {
        const err = new APIError('Provide stripe token!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const requestData = {
        email: req.user.email,
        source: req.body.stripeToken,
        metadata: {
            username: req.user.username,
        },
    };

    stripe.customers.create(requestData, (err, customer) => {
        if (err) {
            const err = new APIError('Customer creation error!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        req.payment = { stripe: {} };
        req.payment.stripe.customerId = customer.id;
        req.message = customer;
        next();
    });

}

function getCustomer(req, res, next) {
    if (req.user.stripe && req.user.stripe.customerId) {
        stripe.customers.retrieve(req.user.stripe.customerId, (err, customer)=> {
            if (err) {
                const err = new APIError('Customer error!', httpStatus.BAD_REQUEST, true);
                return next(err);
            }

            res.status(200).json({ success: true, data: customer });
        });
    } else {
        res.status(200).json({ success: true, data: null });
    }
}

function updateCustomer(req, res, next) {

    if (_.isUndefined(req.query.default_source)) {
        const err = new APIError('Provide default card', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (req.user.stripe && req.user.stripe.customerId) {
        stripe.customers.update(req.user.stripe.customerId, { default_source: req.query.default_source }, (err, customer)=> {
            if (err) {
                const err = new APIError('Customer update error!', httpStatus.BAD_REQUEST, true);
                return next(err);
            }

            res.status(200).json({ success: true, data: customer });
        });
    } else {
        const err = new APIError('No Customer!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }
}

function createCard(req, res, next) {
    if (_.isUndefined(req.body.stripeToken)) {
        const err = new APIError('Provide stripe token!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (req.user.stripe && req.user.stripe.customerId) {
        stripe.customers.createSource(req.user.stripe.customerId, { source: req.body.stripeToken }, (err, card) => {
            if (err) {
                const err = new APIError('Card creation error!', httpStatus.BAD_REQUEST, true);
                return next(err);
            }

            res.status(200).json({ success: true, data: card });
        });
    } else {
        const err = new APIError('Customer does not exist!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

}

function deleteCard(req, res, next) {
    if (_.isUndefined(req.query.cardId)) {
        const err = new APIError('Provide card id!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (req.user.stripe && req.user.stripe.customerId) {
        stripe.customers.deleteCard(req.user.stripe.customerId, req.query.cardId, (err, confirmation) => {
            if (err) {
                const err = new APIError('Card deletion error!', httpStatus.BAD_REQUEST, true);
                return next(err);
            }

            res.status(200).json({ success: true, data: 'Card successfuly deleted' });
        });
    } else {
        const err = new APIError('Customer does not exist!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }
}

/*
 function createCharge(req, res, next){

 if (_.isUndefined(req.body.stripeToken)) {
 const err = new APIError('Provide stripe token!', httpStatus.BAD_REQUEST, true);
 return next(err);
 }

 if (_.isUndefined(req.body.amount)) {
 const err = new APIError('Provide amount!', httpStatus.BAD_REQUEST, true);
 return next(err);
 }

 if (_.isUndefined(req.body.currency)) {
 const err = new APIError('Provide currency!', httpStatus.BAD_REQUEST, true);
 return next(err);
 }



 const requestData = {
 amount: req.body.amount,
 currency: req.body.currency,
 source: req.body.stripeToken,
 description: "Charge for emily.garcia@example.com"
 };

 stripe.charges.create(requestData, function(err, charge) {
 // asynchronously called
 });
 }
 */

function createSubscription(req, res, next) {

    if (req.user.stripe && req.user.stripe.subscriptionId) {
        const err = new APIError('Already subscribed!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    /* if (_.isUndefined(req.body.stripeToken)) {
     const err = new APIError('Provide stripe token!', httpStatus.BAD_REQUEST, true);
     return next(err);
     }*/

    if (_.isUndefined(req.body.planId)) {
        const err = new APIError('Provide planId!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const requestData = {
        customer: req.user.stripe.customerId,
        plan: req.body.planId,
        //source: req.body.stripeToken
    };

    stripe.subscriptions.create(requestData, (err, subscription) => {
        if (err) {
            const err = new APIError('Subscription error!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        req.payment = { stripe: req.user.stripe, planId: subscription.plan.id };
        req.payment.stripe.subscriptionId = subscription.id;
        req.message = 'Subscription created successfuly';
        next();
    });
}

function updateSubscription(req, res, next) {

    if (_.isUndefined(req.user.stripe.subscriptionId)) {
        const err = new APIError('Not subscribed!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (_.isUndefined(req.body.planId)) {
        const err = new APIError('Provide planId!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const requestData = {
        plan: req.body.planId,
    };

    stripe.subscriptions.update(req.user.stripe.subscriptionId, requestData, (err, subscription) => {
        if (err) {
            const err = new APIError('Subscription error!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        req.payment = { stripe: req.user.stripe, planId: subscription.plan.id };
        req.payment.stripe.subscriptionId = subscription.id;
        req.message = 'Subscription created successfuly';
        next();
    });
}

function getSubscription(req, res, next) {
    stripe.subscriptions.retrieve(req.user.stripe.subscriptionId, (err, subscription)=> {
        if (err) {
            const err = new APIError('Subscription error!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        res.status(200).json({ success: true, data: subscription });
    });
}

function deleteSubscription(req, res, next) {

    stripe.subscriptions.del(req.user.stripe.subscriptionId, (err, confirmation)=> {
        if (err) {
            const err = new APIError('Subscription deletion error!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        req.payment = { stripe: _.omit(req.user.stripe.toObject(), 'subscriptionId'), planId: 'Free' };
        req.message = 'Subscription deleted successfuly';
        next();
    });

}

function updateUser(req, res, next) {

    let updatingData = req.payment;

    if (req.payment.planId) {
        updatingData.role = req.payment.planId;
        delete updatingData.planId;
    }

    User.findOneAndUpdate({ username: req.user.username }, { $set: updatingData }, { new: true })
      .then(user=> {
        return res.json({
            success: true,
            data: user,//req.message || {}
        });
    })
      .catch(e=> {
        const err = new APIError('Update error!', httpStatus.BAD_REQUEST, true);
        return next(err);
    });

    /* User.findOneAndUpdate({username: req.user.username}, {$set: updatingData}, {new: true}, (err, user)=> {
         if (err) {

         }

     })*/

}

export default {
    createPlan,
    getPlan,
    removePlan,
    createCustomer,
    getCustomer,
    updateCustomer,
    createSubscription,
    getSubscription,
    updateSubscription,
    deleteSubscription,
    updateUser,
    createCard,
    deleteCard,
};
