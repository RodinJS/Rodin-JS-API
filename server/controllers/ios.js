import User from '../models/user';
import jwt from 'jsonwebtoken';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';
import config from '../../config/env';

function cert(req, res, next) {

    const files = req.files;
    let certs = {};

    for (let i = 0; i < files.length; i++) {
        if (files[i].ext === 'p12') {
            certs.p12 = files[i].filename;
        }

        if (files[i].ext === 'mobileprovision') {
            certs.profile = files[i].filename;
        }
    }

    // User.get(req.user.username)
    // 	.then(user => {
    // 		if (user) {
    // 			User.updateAsync(
    // 				{
    // 					username: req.user.username
    // 				},
    // 				{
    // 					$set: {
    // 						"cert.ios.p12" 	: certs.p12,
    // 						"cert.ios.profile" : certs.profile
    // 					}
    // 				}
    // 			)
    // 			.then(updatedUser => {
    // 				req.user.username
    request({
        method: 'POST',
        preambleCRLF: true,
        postambleCRLF: true,
        uri: 'http://63.135.170.41:8080/create-cert',
        headers: {
            'app-id': config.socket.appId,
            'app-secret': config.socket.appSecret,
        },
        multipart: [
         {
            'content-type': ' application/x-pkcs12',
            body: fs.createReadStream('public/files/cert.p12'),
        },
         {
            'content-type': 'application/octet-stream',
            body: fs.createReadStream('public/files/profile.mobileprovision'),
        },
         {
            'content-type': 'application/json',
            body: JSON.stringify(obj),
        },
          ],
    },
     function (error, response, body) {
        if (error) {
            res.status(500);
            res.end(error);
            return console.error('upload failed:', error);
        }

        res.status(200);
        res.end(body);
        return console.log('Upload successful!  Server responded with:', body);
    });
    // 	})
    // 	.catch((e) => {
    // 		console.log(e);
    // 		const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
    // 		return next(err);
    // 	});
    // } else {
    // 	const err = new APIError('User not found!', 310);
    // 	return next(err);
    // }

    // });
}

export default { cert };
