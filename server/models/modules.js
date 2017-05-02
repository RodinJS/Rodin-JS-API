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

});

modules.statics = {

    getById(moduleId) {
        return this.findById(moduleId).execAsync()
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

    list({ skip = 0, limit = 50 } = {},  _queryString = null) {
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

        return this.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .execAsync();
    },

};

export default mongoose.model('Modules', modules);
