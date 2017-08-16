/**
 * Created by Reinchard on 8/15/2017.
 */

import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import Menus from '../models/menus';

function list(req, res, next) {

  Menus.getMenusList()
    .then((menusList) => onSuccess(menusList, res))
    .catch((e) => next(e));
}

function onSuccess(data, res) {
  return res.status(200).json({success: true, data: data});
}

function onError(e, next) {
  console.log(e);
  const err = new APIError(`Bad request`, httpStatus.BAD_REQUEST, true);
  return next(err);
}

export default {
  list
};
