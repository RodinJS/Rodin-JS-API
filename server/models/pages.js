import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Project Schema
 */
const Pages = new mongoose.Schema({

    slug: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    content: {
        type: Object,

    },

});

Pages.statics = {

    get(pageURL) {
        return this.findOne({ slug: pageURL, state: 'published' }).execAsync()
            .then((page) => {
            if (page) {
                return page;
            }

            const err = new APIError('No such page exists!----', httpStatus.NOT_FOUND, true);
            return Promise.reject(err);
        })
            .catch((e) => {
            const err = new APIError('No such page exists!', httpStatus.NOT_FOUND, true);
            return Promise.reject(err);
        });
    },

    getPagesList() {
        return this.find({ state: 'published' }).select({ title: 1, slug: 1 })
          .then((pages) => {
            if (pages) {
                return pages;
            }

            const err = new APIError('Error while requesting pages list!----', httpStatus.NOT_FOUND, true);
            return Promise.reject(err);
        })
          .catch((e)=> {
            const err = new APIError('Error while requesting pages list!----', httpStatus.NOT_FOUND, true);
            return Promise.reject(err);
        });
    },

};

export default mongoose.model('cms_pages', Pages);
