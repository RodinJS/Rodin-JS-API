/**
 * Created by Reinchard on 8/14/2017.
 */
import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Menu Schema
 */
const Menus = new mongoose.Schema({

  slug: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
});

Menus.statics = {
  getMenusList() {
    return this.aggregate([
      {$match: {"state": "published"}},

      {$unwind: {path: "$items", "preserveNullAndEmptyArrays": true}},
      {
        $lookup: {
          "from": "cms_menuitems",
          "localField": "items",
          "foreignField": "_id",
          "as": "menuitem"
        }
      },
      {$unwind: {path: "$menuitem", "preserveNullAndEmptyArrays": true}},
      {
        $group: {
          _id: "$_id",
          slug: {"$first": "$slug"},
          name: {"$first": "$name"},
          state: {"$first": "$state"},
          position: {"$first": "$position"},
          items: {"$push": "$items"},
          menuitems: {"$push": "$menuitem"}
        }
      }
    ]).then(menus => {
      if (!menus) {
        const err = new APIError('Error while requesting menus list!----', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      }
      return menus;
    })
      .catch((e) => {
        const err = new APIError('Error while requesting pages list!----', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },
};

export default mongoose.model('cms_menus', Menus);
