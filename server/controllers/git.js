import GitHubApi from 'github';
import request from 'request-promise';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import _ from 'lodash';
import config from '../../config/env';

const APIURLS = {
  AUTH: 'https://github.com/login/oauth/access_token',
  USER: 'https://api.github.com/user?access_token=',
  EMAIL: 'https://api.github.com/user/emails?access_token='
};

function getToken(req, res, next) {

  const options = {
    uri: APIURLS.AUTH,
    qs: {
      code: req.query.code,
      client_id: config.social.github.clientId,
      client_secret: config.social.github.clientSecret
    },
    headers: {
      'User-Agent': 'Rodin-JS-API'
    },
    json: true
  };

  request(options)
    .then(function (token_info) {
      console.log(`github-access-token is ${token_info.access_token}`);
      req.gitAccessToken = token_info.access_token;
      next();

    })
    .catch(function (err) {
      return next(err);
    });
}

function getUser(req, res, next) {
  const userOptions = {
    uri: `${APIURLS.USER}${req.gitAccessToken}`,
    headers: {
      'User-Agent': 'Rodin-JS-API',
    },
    json: true
  };
  const emailOptions = {
    uri: `${APIURLS.EMAIL}${req.gitAccessToken}`,
    headers: {
      'User-Agent': 'Rodin-JS-API',
    },
    json: true
  };
  request(userOptions)
    .then((gitUser) => {
      req.params.socialName = 'github';
      req.body = {
        id: gitUser.id,
        username: gitUser.login || false,
      };
      return request(emailOptions);
    })
    .then((gitUserEmail) => {
      let primaryEmail = _.find(gitUserEmail, (email) => {
        return email.primary === true;
      }).email;
      req.body.email = primaryEmail;
      return next();
    })
    .catch((err) => {
      return next(err);
    })
}

function successAuth(req, res, next){
  res.cookie('token', req.token);
  res.redirect(config.clientURL);
}

export default {getToken, getUser, successAuth};
