import request from 'request';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import config from '../../config/env';

const generate = device => (req, res, next) => {
    request.get(
      {
        url: `${config[device].urls.get}/${req.project.build[device].buildId}`,
        headers: {
            'app-id': config[device].appId,
            'app-secret': config[device].appSecret,
        },
    },
      (err, httpResponse, body) => {
        if (err || httpResponse.statusCode !== 200) {
            return next(new APIError('Internal Server Error', httpStatus.INTERNAL_SERVER_ERROR, true));
        }

        res.status(200).json({
            success: true,
            data: {
                downloadUrl: `${config[device].urls.download}/${JSON.parse(body).data.downloadUrl}`,
            },
        });
    }
    );
};

const ios = generate('ios');
const android = generate('android');
const oculus = generate('oculus');
const vive = generate('vive');

export default { ios, android, oculus, vive };
