import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Project Schema
 */
const Landing = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    publishedDate: {
        type: Object,

    },

});

Landing.statics = {

    get() {
        return this.findOne({}, {}, { sort: { 'publishedDate' : -1 } })
          .then(landing=>{
            if(landing) return landing;
            const err = new APIError('No such page exists!----', httpStatus.NOT_FOUND, true);
            return Promise.reject(err);
          })
          .catch((e)=>{
            console.log(e);
            const err = new APIError('No such page exists!', httpStatus.NOT_FOUND, true);
            return Promise.reject(err)
          })
    }

};

export default mongoose.model('cms_landing', Landing);
