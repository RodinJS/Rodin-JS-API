import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Project Schema
 */
const modules = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
    },
    author: {
        type: String,
        required: true,
        default: 'Rodin team',
    },
    email:{
      type: String,
      required: true,
      default: 'support@rodin.io',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    url: {
        type: String,
        required: true,
    },
    exampleLink: {
        type: String,
    },
    documentationLink: {
        type: String,
    },
    status:{
      type:String,
      enum: ['Pending', 'Rejected', 'InReview', 'Active'],
      default: 'Pending',
      required: true,
    }

});

modules.statics = {

    getById(moduleId) {
        return this.findById(moduleId)
          .then((module) => {
            if (module) {
                return module;
            } else {
                const err = new APIError('No such module exists!----', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            }
        })
          .catch((e) => {
            const err = new APIError('No such module exists!', httpStatus.NOT_FOUND, true);
            return Promise.reject(err);
        });
    },

    delete(code) {
    },

    list({ skip = 0, limit = 50 } = {},  _queryString = null, status = 'Active') {
        const query = {};
        if (_queryString) {
            _queryString = _queryString.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
            const re = new RegExp(_queryString, 'gi');
            query.$or = [
              {
                title: re,
            },
              {
                description: re,
            },
              {
                author: re,
            },
            ];
        }

        query.$and = [
          {status:{$eq:status}}
        ];

        return this.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
    },

    countByModuleStatus() {
      return this.aggregate([{ "$group": {
        "_id": "$status",
        "count": { "$sum": 1 }
      } }]);
    }

};

export default mongoose.model('Modules', modules);
