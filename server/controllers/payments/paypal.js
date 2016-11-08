import _ from 'lodash';
import config from '../../../config/env';
import APIError from '../../helpers/APIError';
import httpStatus from '../../helpers/httpStatus';
import User from '../../models/user';
import paypal from 'paypal-rest-sdk';
const paypalSettings = config.payments.tokens.paypal;

paypal.configure({
    'mode': paypalSettings.mode, //sandbox or live
    'client_id': paypalSettings.clientId,
    'client_secret': paypalSettings.clientSecret
});

export default {};