/**
 * Created by Reinchard on 7/12/2017.
 */
import Blog from '../models/blogSubscribe';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';
import RDSendgrid from '../helpers/sendgrid';

function subscribe(req, res, next) {
  let subscribe = new Blog({
    email: req.body.email
  });
  subscribe.save()
    .then(resp => {
      req.mailSettings = {
        to: req.body.email,
        from: 'team@rodin.io',
        fromName: 'Rodin team',
        templateName: 'rodin_metaverse',
        subject: 'Rodin Blog',
        handleBars: [{
          name: 'userName',
          content: 'Success',
        }]
      };
      RDSendgrid.send(req);
      res.status(201).json({
        "success": true,
        "data": resp
      })
    })
    .catch(error => {
      const err = new APIError('User already subscribed', httpStatus.BAD_REQUEST, true);
      return next(err);
    });
}

export default {subscribe}
