import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

const Mixed = mongoose.Schema.Types.Mixed;
const ObjectID = mongoose.Schema.Types.ObjectId;

/**
 * Notifications Schema
 */
const NotificationsSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  label: {
    type: String,
  },
  error: {
    type: Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

NotificationsSchema.statics = {


  getOne(id) {
    return this.findOne({_id: id})  //new RegExp('^' + id + '$', "i")
      .execAsync().then((project) => {
        if (project) {
          return project;
        } else {
          const err = new APIError('No such notification exists!----', httpStatus.NOT_FOUND, true);
          return Promise.reject(err);
        }
      })
      .error((e) => {
        const err = new APIError('No such notification exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },

  list({skip = 0, limit = 50} = {}, username) {
    return this.find({username:username})
      .sort({createdAt: -1})
      .skip(skip)
      .limit(limit)
      .execAsync();
  }
};

export default mongoose.model('Notifications', NotificationsSchema);
