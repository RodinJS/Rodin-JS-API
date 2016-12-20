import User from '../models/user';
import InvitationCode from '../models/invitationCode';
import PreSignUp from '../models/preSignUp';
import Project from '../models/project';
import jwt from 'jsonwebtoken';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import fs from 'fs';
import fsExtra from 'fs-extra';
import utils from '../helpers/common';
import _ from 'lodash';
import mandrill from '../helpers/mandrill'
import notifications from './notifications';
import config from '../../config/env';
/**
 * Load user and append to req.
 */
function load(req, res, next, username) {
  jwt.verify(req.headers['x-access-token'], config.jwtSecret, function (err, decoded) {
    if (err) {
      const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
      return res.status(httpStatus.BAD_REQUEST).json(err);
    } else {
      User.get(decoded.username).then((user) => {
        req.user = {
          email: user.email,
          username: user.username,
          role: user.role,
          profile: user.profile
        };

        return next();
      }).error((e) => next(e));
    }
  });
}


/**
 * Get user
 * @returns {User}
 */
function get(req, res, next) {

  User.get(req.params.username).then((user) => {
    if (!user) {
      const err = new APIError('Not found', httpStatus.NOT_FOUND, true);
      return next(err);
    }
    let response = {
      "success": true,
      "data": {
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile
      }
    };

    return res.status(200).json(response);
  }).error((e) => {
    const err = new APIError('Something happen', httpStatus.BAD_REQUEST, true);
    return next(err);
  });
}

/**
 * Get user
 * @returns {User}
 */
function me(req, res) {


  let response = {
    "success": true,
    "data": {
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      profile: req.user.profile,
      creationDate: req.user.creationDate,
      usernameConfirmed: req.user.usernameConfirmed,
      github: req.user.github,
      facebook: req.user.facebook,
      google: req.user.google,
      steam: req.user.steam,
      oculus: req.user.oculus,
    }
  };

  //concat stripe
  if (req.user.stripe)
    response.data.stripe = req.user.stripe;

  //concat projects count
  if (req.query.projectsCount)
    response.data.projects = req.projectsCount;

  //concat usedStorage
  if (req.query.usedStorage)
    response.data.usedStorage = utils.byteToMb(req.usedStorage);


  return res.status(200).json(response);
}


/**
 * Confirm User name
 * @param req
 * @param res
 */
function confirmUsername(req, res, next) {

  if (req.user.usernameConfirmed) {
    const err = new APIError('Username updated', httpStatus.BAD_REQUEST, true);
    return res.status(httpStatus.BAD_REQUEST).json(err);
  }

  if (_.isUndefined(req.body.username)) {
    const err = new APIError('Please provide username', httpStatus.BAD_REQUEST, true);
    return res.status(httpStatus.BAD_REQUEST).json(err);
  }
  req.body.usernameConfirmed = true;

  User.findOneAndUpdate({username: req.user.username}, {$set: req.body}, {new: true})
    .then(user => {
      let rootDir = config.stuff_path + 'projects/' + user.username;
      let publicDir = config.stuff_path + 'public/' + user.username;
      let publishDir = config.stuff_path + 'publish/' + user.username;

      if (!fs.existsSync(rootDir)) {
        fs.mkdirSync(rootDir); //creating root dir for project
      }

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir); //creating root dir for public
      }

      if (!fs.existsSync(publishDir)) {
        fs.mkdirSync(publishDir); //creating root dir for publish
      }

      req.user = user;
      return next();
    })
    .catch(e => {
      const err = new APIError('Something went wrong', httpStatus.BAD_REQUEST, true);
      return res.status(httpStatus.BAD_REQUEST).json(err);
    });
}

function resetPassword(req, res, next) {
  if (_.isUndefined(req.body.resetData)) {
    const err = new APIError('Please provide username or email', httpStatus.BAD_REQUEST, true);
    return res.status(httpStatus.BAD_REQUEST).json(err);
  }

  const query = {$or: [{username: req.body.resetData}, {email: req.body.resetData}]};

  User.findOne(query, (err, user) => {
    if (err) {
      const err = new APIError('Something wrong!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

    if (!user) {
      const err = new APIError('User not exist!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

    const email = user.email;

    const resetToken = jwt.sign({ //jwt.verify
      username: user.username,
      email: user.email,
      random: user.password.slice(-15)
    }, config.jwtSecret, {
      expiresIn: "1d"
    });

    req.mailSettings = {
      to: email,
      from: 'team@rodin.space',
      fromName: 'Rodin team',
      templateName: 'rodin_forget',
      subject: 'Password reset request',
      handleBars: [{
        name: 'userName',
        content: user.profile.firstName || user.username
      },
        {
          name: 'resetLink',
          content: `${config.clientURL}/reset-password?t=${resetToken}`
        }]
    };
    mandrill.sendMail(req, res, () => {
      let responseMessage = 'Mail sent';

      if (req.body.test && req.body.test === 'giveMeAToken')
        responseMessage = resetToken;

      res.status(200).json({success: true, data: responseMessage});
    });

  })


}

function changePassword(req, res, next) {
  if (req.body.password != req.body.confirmPassword) {
    const err = new APIError('Password not match', httpStatus.BAD_REQUEST, true);
    return next(err);
  }
  jwt.verify(req.body.token, config.jwtSecret, (err, decoded) => {
    if (err) {
      const err = new APIError('Invalid token or secret', httpStatus.UNKNOWN_TOKEN, true);
      return next(err);
    }
    delete req.body.token;
    delete req.body.confirmPassword;
    req.user = {
      username: decoded.username,
      email: decoded.email
    };
    return next();
  })
}

/**
 * Create new user
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function create(req, res, next) {
  User.get(req.body.username)
    .then(user => {
      if (user) {
        const err = new APIError('User exists', 311);
        return next(err);
      }

      let userObject = {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        profile: {
          firstName: req.body.firstName,
          lastName: req.body.lastName
        },
        usernameConfirmed: true
      };

      if (req.body.invitationCode) {
        userObject.role = 'Premium';
        userObject.storageSize = 500;
        userObject.allowProjectsCount = 5;
      }

      if (req.preSignUpData) {
        userObject[req.preSignUpData.type] = req.preSignUpData.userId;
      }

      user = new User(userObject);

      user.saveAsync()
        .then((savedUser) => {
          let rootDir = config.stuff_path + 'projects/' + savedUser.username;
          let publicDir = config.stuff_path + 'public/' + savedUser.username;
          let publishDir = config.stuff_path + 'publish/' + savedUser.username;
          let historyDir = config.stuff_path + 'history/' + savedUser.username;

          if (!fs.existsSync(rootDir)) {
            fs.mkdirSync(rootDir); //creating root dir for project
          }

          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir); //creating root dir for public
          }

          if (!fs.existsSync(publishDir)) {
            fs.mkdirSync(publishDir); //creating root dir for publish
          }

          if (!fs.existsSync(historyDir)) {
            fs.mkdirSync(historyDir); //creating root dir for history
          }

          //if (req.body.invitationCode)
          //InvitationCode.delete(req.body.invitationCode);

          if (req.preSignUpData)
            PreSignUp.delete(req.preSignUpData.code);

          const token = jwt.sign({
            username: savedUser.username,
            role: savedUser.role,
            random: savedUser.password.slice(-15)
          }, config.jwtSecret, {
            expiresIn: "7d"
          });

          req.mailSettings = {
            to: savedUser.email,
            from: 'team@rodin.space',
            fromName: 'Rodin team',
            templateName: 'rodin_signup',
            subject: 'Welcome to Rodin platform',
            handleBars: [{
              name: 'dateTime',
              content: utils.convertDate()
            }, {
              name: 'userName',
              content: savedUser.username
            }]
          };

          mandrill.sendMail(req, res, () => {
            return res.json({
              "success": true,
              "data": {
                token,
                user: {
                  email: savedUser.email,
                  username: savedUser.username,
                  role: savedUser.role,
                  profile: savedUser.profile
                }
              }
            });

          });
        })
        .error((e) => {
          const err = new APIError("Something went wrong!", httpStatus.SOMETHING_WENT_WRONG, true);
          return next(err);
        });
    })
    .error((e) => next(e));
}

/**
 * Update existing user
 * @property {string} req.params.username - The email of user.
 * @returns {User}
 */
function update(req, res, next) {

  User.updateAsync({username: req.params.username}, {$set: req.body})
    .then(() => res.json({
      "success": true,
      "data": {}
    }))
    .error((e) => next(e));
}

function unsyncSocial(req, res, next){
  let field = {};
  switch(req.params.socialName){
    case 'facebook' : field.$unset = {facebookId:1}; break;
    case 'github' : field.$unset = {github:1}; break;
    case 'google' : field.$unset = {google:1}; break;
    case 'steam' : field.$unset = {steamId:1}; break;
    case 'oculus' : field.$unset = {oculusId:1}; break;
  }
  if(!field.$unset){
    const err = new APIError('Provilde right Social ', 400);
    return next(err);
  }

  User.updateAsync({username: req.params.username}, field)
    .then(() => res.json({
      "success": true,
      "data": {}
    }))
    .error((e) => next(e));
}

function updatePassword(req, res, next) {
  User.findOneAsync({username: req.user.username})
    .then((user) => {
      user.password = req.body.password;
      user.saveAsync()
        .then((user) => {
          req.user = user;
          req.notification = {
            data: 'Password has been changed'
          };
          notifications.create(req, false, false);
          return next();
        })
        .error((e) => next(e));
    })
    .error((e) => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const {limit = 50, skip = 0} = req.query;
  User.list({limit, skip}).then((users) => res.json(users))
    .error((e) => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const username = req.user.username;

  User.get(username)
    .then(user => {
      if (user) {
        let rootDir = config.stuff_path + 'projects/' + username;
        let publicDir = config.stuff_path + 'public/' + username;
        let publishDir = config.stuff_path + 'publish/' + username;

        fsExtra.removeSync(rootDir);
        fsExtra.removeSync(publicDir);
        fsExtra.removeSync(publishDir);

        for (let i = 0; i < user.projects.length; i++) {

          Project.removeAsync({_id: user.projects[i]})
            .then((deletedProject) => {
            }).error((e) => next(e));
        }
      } else {
        const err = new APIError("Something went wrong!", 312, true);
        return next(err);
      }
      User.removeAsync({username: username})
        .then((deletedUser) => res.status(200).json({
          "success": true,
          "data": deletedUser
        }))
        .error((e) => next(e));
    })
    .catch((e) => {
      const err = new APIError('User not found!', httpStatus.BAD_REQUEST, true);
      return next(err);
    });


}

function validateInvitationCode(req, res, next) {

  //todo: temporary invitation code is required
  if (!req.body.invitationCode) {
    const err = new APIError("Invitation code is required", httpStatus.BAD_REQUEST, true);
    return next(err);
    //return next();
  }

  if (req.body.invitationCode !== '2B5H7B') {
    const err = new APIError("Invitation code is wrong", httpStatus.BAD_REQUEST, true);
    return next(err);
  }
  next();
  /* InvitationCode.get(req.body.invitationCode)
   .then((invitationCode) => {

   if (invitationCode) {

   invitationCode = invitationCode.toObject();
   let dateDiff = dateDiffInDays(invitationCode.creationDate, new Date());
   if (invitationCode.email == req.body.email && dateDiff < 7) {
   return next();
   }
   else {
   delete req.body.invitationCode;

   if (dateDiff > 7)
   InvitationCode.delete(invitationCode.invitationCode);

   return next();
   }
   }
   else {
   delete req.body.invitationCode;
   return next();
   }
   });


   // a and b are javascript Date objects
   function dateDiffInDays(a, b) {
   let MS_PER_DAY = 1000 * 60 * 60 * 24;
   // Discard the time and time-zone information.
   let utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
   let utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
   return Math.floor((utc2 - utc1) / MS_PER_DAY);
   }*/

}

function validatePreSignUpCode(req, res, next) {
  if (!req.body.signUpCode) return next();

  PreSignUp.get(req.body.signUpCode)
    .then((preSignUp) => {

        if (preSignUp) {

          preSignUp = preSignUp.toObject();
          let type = '';
          switch (preSignUp.source) {
            case 'steam':
              type = 'steamId';
              break;
            case 'oculus':
              type = 'oculusId';
              break;
          }

          req.preSignUpData = {
            userId: preSignUp.userId,
            type: type,
            code: req.body.signUpCode
          };
          return next();
        }
        else {
          const err = new APIError('Sign up code wrong or does not exist', httpStatus.BAD_REQUEST, true);
          return next(err);
        }
      },
      e => {
        const err = new APIError('Sign up code wrong or does not exist', httpStatus.BAD_REQUEST, true);
        return next(err);
      });

}

function finalize(req, res, next) {
  return res.status(200).json({
    "success": true,
    "data": req.user
  });
}

export default {
  load,
  get,
  create,
  update,
  updatePassword,
  list,
  remove,
  me,
  validateInvitationCode,
  validatePreSignUpCode,
  confirmUsername,
  resetPassword,
  changePassword,
  finalize,
  unsyncSocial
};
