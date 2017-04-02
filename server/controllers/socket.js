import config from '../../config/env';
import request from 'request-promise';

/**
 * Get connection information from socket server
 * @returns {json}
 */
function connect(req, res, next) {
    let options = {
        method: 'POST',
        uri: 'http://162.243.217.162:1234/api/v1/connect',
        body: {
            appId: config.socket.appId,
            appSecret: config.socket.appSecret,
            info: {
                name: 'Neo',
            },
        },
        json: true, // Automatically stringifies the body to JSON
    };

    request(options)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(err.error.status).json(err);
        });

}

export default { connect };
