/**
 * Created by Reinchard on 7/12/2017.
 */
// jscs:disable validateIndentation
import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

/**
 * Blog Subscribers Schema
 */

const BlogSubscribe = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  unsubscribed: {
    type: Boolean,
    default: false
  },
  unsubscrbedDate: {
    type: Date,
  }
});


/**
 * Methods
 */
BlogSubscribe.method({

});

/**
 * Statics
 */
BlogSubscribe.statics = {

};

/**
 * @typedef BlogSubscribe
 */
export default mongoose.model('blogSubscribe', BlogSubscribe);
