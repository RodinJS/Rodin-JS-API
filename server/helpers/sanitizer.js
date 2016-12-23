/**
 * Module dependencies.
 */

import _ from 'lodash';
import sanitizer from 'sanitizer';
import htmlencode from 'htmlencode';


const Sanitizer = {

  encoder: 'htmlEncode',

  sanitize: true,

  _sanitize: function (obj) {

    if (typeof obj === 'string') {

      if (Sanitizer.sanitize) {
        obj = sanitizer.sanitize(obj);
      }
      if (Sanitizer.encoder) {
        obj = htmlencode[Sanitizer.encoder](obj);
      }
      return obj;

    }

    if (obj instanceof Object) {
      Object.keys(obj).forEach((prop) => {
        obj[prop] = Sanitizer._sanitize(obj[prop]);
      });
      return obj;
    }
    return obj;
  },

  makeSanitize: function (req, res, next) {
    [req.body, req.query].forEach((val, ipar, request) => {
      if (_.size(val)) {
        request[ipar] = Sanitizer._sanitize(request[ipar])
      }
    });

    next();
  },
};


module.exports = Sanitizer;
