import request from "request";
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import config from '../../config/env';

const ios = (req, res, next) => {
  request.get(
    {
      url: `${config.ios.urls.get}/${req.project.build.ios.buildId}`,
      headers: {
        'app-id': config.ios.appId,
        'app-secret': config.ios.appSecret
      }
    },
    (err, httpResponse, body) => {
      if(err || httpResponse.statusCode !== 200) {
        return next(new APIError('Internal Server Error', httpStatus.INTERNAL_SERVER_ERROR, true));
      }

      res.status(200).json({
        success: true,
        data: {
          downloadUrl: `${config.ios.urls.download}/${JSON.parse(body).data.downloadUrl}`
        }
      });
    }
  )
};

const android = (req, res, next) => {
  request.get(
    {
      url: `${config.android.urls.get}/${req.project.build.android.buildId}`,
      headers: {
        'app-id': config.android.appId,
        'app-secret': config.android.appSecret
      }
    },
    (err, httpResponse, body) => {
      if(err || httpResponse.statusCode !== 200) {
        return next(new APIError('Internal Server Error', httpStatus.INTERNAL_SERVER_ERROR, true));
      }

      res.status(200).json({
        success: true,
        data: {
          downloadUrl: `${config.android.urls.download}/${JSON.parse(body).data.downloadUrl}`
        }
      });
    }
  )
};

export default {ios, android}
