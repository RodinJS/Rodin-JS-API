import _ from 'lodash';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import Pages from '../models/pages';

function list(req, res, next) {

    Pages.getPagesList()
      .then((pagesList) => onSuccess(pagesList, res))
      .catch((e) => next(e));
}

function getByUrl(req, res, next) {
    if (_.isUndefined(req.params.url)) {
        const err = new APIError(`Provide URL`, httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const pageURL = req.params.url;
    Pages.get(pageURL)
        .then(page => onSuccess(page, res))
        .catch(err => onError(err, next));
}

function onSuccess(data, res) {
    return res.status(200).json({ success: true, data: data });
}

function onError(e, next) {
    console.log(e);
    const err = new APIError(`Bad request`, httpStatus.BAD_REQUEST, true);
    return next(err);
}

export default {
    list,
    getByUrl,

};
