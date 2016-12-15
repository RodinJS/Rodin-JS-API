import User from '../models/user';
import PreSignUp from '../models/preSignUp';
import InvitationCode from '../models/invitationCode';
import jwt from 'jsonwebtoken';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';
import Utils from '../helpers/common';
import mandrill from '../helpers/mandrill';
import fs from 'fs';
import _    from 'lodash';


import commonHelpers from '../helpers/common';

import config from '../../config/env';

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  User.get(req.body.username)
    .then(user => {
      if (user) {
        user.comparePassword(req.body.password).then(isMatch => {
          if (isMatch) {
            req.user = user;
            return next();
          } else {
            const err = new APIError('Authentication error', 310);
            return next(err);
          }
        });
      } else {
        const err = new APIError('Authentication error', 310);
        return next(err);
      }
    });
}

/**
 * Handling user info from
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function finalizeUser(req, res, next) {

  if (!req.user) {
    const err = new APIError('Authentication error', 310);
    return next(err);
  }
  const user = req.user;
  const token = req.token || jwt.sign({ //jwt.verify
      username: user.username,
      role: user.role,
      random: user.password.slice(-15)
    }, config.jwtSecret, {
      expiresIn: "7d"
    });

  return res.status(200).json({
    "success": true,
    "data": {
      token,
      user: {
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        usernameConfirmed: req.user.usernameConfirmed
      }
    }
  });
}

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function socialAuth(req, res, next) {

  let queryMethod = {};

  if (req.params.socialName === 'facebook') {
    queryMethod = {$or: [{facebookId: req.body.id}, {email: req.body.email}]};
  }

  else if (req.params.socialName === 'google') {
    queryMethod = {$or: [{googleId: req.body.id}, {email: req.body.email}]};
  }

  else if (req.params.socialName === 'steam') {
    queryMethod = {$or: [{steamId: req.body.id}, {email: req.body.email}]};
  }

  else if (req.params.socialName === 'oculus') {
    queryMethod = {$or: [{oculusId: req.body.id}, {email: req.body.email}]};
  }

  else if (req.params.socialName === 'github') {
    queryMethod = {$or: [{'github.id': req.body.id}, {email: req.body.email}]};
  }

  else {
    const err = new APIError('Wrong login method', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  User.findOne(queryMethod)
    .then(user => {
      if (!user) {

        if (_.isUndefined(req.body.id)) {
          const err = new APIError('Please provide userId', httpStatus.BAD_REQUEST, true);
          return next(err);
        }

        if (_.isUndefined(req.body.email)) {
          const err = new APIError('Please provide email', httpStatus.BAD_REQUEST, true);
          return next(err);
        }


        let userObject = {
          email: req.body.email,
          username: req.body.username || req.body.id,
          password: Utils.generateCode(8),
          profile: {
            firstName: req.body.first_name || '',
            lastName: req.body.last_name || ''
          },
          role: 'Free',
          usernameConfirmed: req.body.username ? true : false
        };

        if (req.params.socialName == 'facebook') {
          userObject.facebookId = req.body.id;
        }

        else if (req.params.socialName === 'google') {
          userObject.googleId = req.body.id;
        }

        else if (req.params.socialName === 'steam') {
          userObject.steamId = req.body.id;
        }

        else if (req.params.socialName === 'oculus') {
          userObject.oculusId = req.body.id;
        }

        else if (req.params.socialName === 'github') {
          userObject.github = {
            id: req.body.id,
            token: req.gitAccessToken
          }
        }

        else {
          const err = new APIError('Wrong login method', httpStatus.BAD_REQUEST, true);
          return next(err);
        }


        user = new User(userObject);
        user.saveAsync(userObject)
          .then((savedUser) => {

            //setup project folder for confirmed User
            if (userObject.usernameConfirmed) {

              let rootDir = '/var/www/stuff/projects/' + savedUser.username;
              let publicDir = '/var/www/stuff/public/' + savedUser.username;
              let publishDir = '/var/www/stuff/publish/' + savedUser.username;

              if (!fs.existsSync(rootDir)) {
                fs.mkdirSync(rootDir); //creating root dir for project
              }

              if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir); //creating root dir for public
              }

              if (!fs.existsSync(publishDir)) {
                fs.mkdirSync(publishDir); //creating root dir for publish
              }

            }


            req.mailSettings = {
              to: savedUser.email,
              from: 'team@rodin.space',
              fromName: 'Rodin team',
              templateName: 'rodin_signup',
              subject: 'Welcome to Rodin platform',
              handleBars: [{
                name: 'dateTime',
                content: Utils.convertDate()
              }, {
                name: 'userName',
                content: savedUser.username
              }]
            };
            req.user = savedUser;


            req.token = jwt.sign({ //jwt.verify
              username: savedUser.username,
              role: savedUser.role,
              random: savedUser.password.slice(-15)
            }, config.jwtSecret, {
              expiresIn: "7d"
            });

            mandrill.sendMail(req, res, () => {
              return next();
            });

          })
          .error((e) => {
            const err = new APIError('Something wrong!', httpStatus.BAD_REQUEST, true);
            return next(err);
          });


      }
      else {

        let userUpdate = false;

        if (req.params.socialName === 'facebook' && !user.facebookId) {
          userUpdate = {$set: {facebookId: req.body.id}}
        }

        else if (req.params.socialName === 'google' && !user.googleId) {
          userUpdate = {$set: {googleId: req.body.id}}
        }

        else if (req.params.socialName === 'github') {
          if(req.body.sync){
            userUpdate = {$set: {'github.token': req.body.token, 'github.id':req.body.id}}
          }
          else{
            userUpdate = {$set: {'github.token': req.gitAccessToken}}
          }
        }

        if (userUpdate) {

          return User.updateAsync({username: user.username}, userUpdate)
            .then(() => {

              if(req.body.sync){
                return res.status(200).json({success:true, data:user});
              }

              req.user = user;

              req.token = jwt.sign({ //jwt.verify
                username: user.username,
                role: user.role,
                random: user.password.slice(-15)
              }, config.jwtSecret, {
                expiresIn: "7d"
              });

              return next();

            })
            .error((e) => {
              const err = new APIError('Something wrong!', httpStatus.BAD_REQUEST, true);
              return next(err);
            });
        }
        req.user = user;
        return next();
      }
    })
    .catch(e => {
      const err = new APIError('Something wrong!', httpStatus.BAD_REQUEST, true);
      return next(err);
    });
}

/**
 * Token verify endpoint
 * @param req
 * @param res
 * @returns {true/false}
 */
function verify(req, res, next) {
  jwt.verify(req.headers['x-access-token'], config.jwtSecret, function (err, decoded) {
    if (err) {
      const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
      return next(err);
    }
    return res.status(200).json({success: true});
  });

}

/**
 * Logout logic happens here :D
 * @param req
 * @param res
 * @returns {*}
 */
function logout(req, res) {
  return res.status(200).json({success: true}); //TODO: remove token from Redis!
}

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function generateInvitationCode(req, res, next) {
  if (!req.body.email) {
    const err = new APIError('Please provide email address', httpStatus.BAD_REQUEST, true);
    return next(err);
  }
  const code = commonHelpers.generateCode(7);
  const email = req.body.email;
  let invitationCode = new InvitationCode({email: email, invitationCode: code});
  invitationCode.save((err) => {
    if (err) {
      const err = new APIError('Something wrong', httpStatus.BAD_REQUEST, true);
      return next(err);
    }
    res.status(200).json({success: true, invitationCode: code});
  })

}

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function removeInvitationCode(req, res, next) {
  let invitationCode = req.body.invitationCode;
  return InvitationCode.delete(invitationCode)
    .then(() => {
      if (res) {
        res.status(200).json({success: true, code: invitationCode});
      }
      return {success: true}
    })
    .error((e) => {
      if (next) {
        const err = new APIError('Something wrong', httpStatus.BAD_REQUEST, true);
        return next(err);
      }
      return {success: false, error: e}
    });
}


export default {login, logout, verify, generateInvitationCode, removeInvitationCode, finalizeUser, socialAuth};
