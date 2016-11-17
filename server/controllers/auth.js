import User from '../models/user';
import PreSignUp from '../models/preSignUp';
import InvitationCode from '../models/invitationCode';
import jwt from 'jsonwebtoken';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';
import Utils from '../helpers/common';
import _    from 'lodash';


import commonHelpers from '../helpers/common';

const config = require('../../config/env');

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

    if(!req.user){
        const err = new APIError('Authentication error', 310);
        return next(err);
    }
    const user = req.user;
    const token = jwt.sign({ //jwt.verify
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
                usernameConfirmed:req.user.usernameConfirmed
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
function socialAuth(req, res, next){
    let queryMethod = {}, userObject = {
        email:req.body.email,
        username: req.body.id,//Utils.getUserNameFromEmail(profile._json.email),
        password:Utils.generateCode(8),
        profile: {
            firstName:req.body.first_name || '',
            lastName:req.body.last_name || ''
        },
        role:'Free',
        usernameConfirmed:false
    };

    if(req.body.type == 'facebook'){
      queryMethod = {$or: [{facebookId: req.body.id}, {email: req.body.email}]};
      userObject.facebookId = req.body.id;
    }

    else if(req.body.type == 'google'){
        queryMethod = {$or: [{googleId: req.body.id}, {email: req.body.email}]};
        userObject.googleId = req.body.id;
    }

    else {
        const err = new APIError('Wrong login method', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    User.findOne(queryMethod, (err, user) => {
        if(err){
            const err = new APIError('Something wrong!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        if(!user){
            user = new User(userObject);
            user.saveAsync(userObject)
                .then((savedUser) => {
                    req.user = savedUser;
                    return next();
                })
                .error((e) => {
                    const err = new APIError('Something wrong!', httpStatus.BAD_REQUEST, true);
                    return next(err);
                });
        }
        else{
            let userUpdate = false;

            if(req.body.type == 'facebook' && !user.facebookId){
               userUpdate  = {$set: {facebookId:req.body.id}}
            }
            else if(req.body.type == 'google' && !user.googleId){
              userUpdate = {$set: {googleId:req.body.id}}
            }

            if(userUpdate){
                return User.updateAsync({username: user.username}, userUpdate)
                    .then(() => {
                        req.user = user;
                        return next();
                    })
                    .error((e)=> {
                        const err = new APIError('Something wrong!', httpStatus.BAD_REQUEST, true);
                        return next(err);
                    });
            }
            req.user = user;
            return next();
        }
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


function preSignUp(req, res, next){

    if (_.isUndefined(req.body.userId)) {
        const err = new APIError('Please provide userId', httpStatus.BAD_REQUEST, true);
        return next(err);
    }
    if (_.isUndefined(req.body.source)) {
        const err = new APIError('Please provide source (steam, oculus)', httpStatus.BAD_REQUEST, true);
        return next(err);
    }
    const code = commonHelpers.generateCode(10);

    let preSignUp = new PreSignUp({userId:req.body.userId, source:req.body.source, code:code});
    preSignUp.save((err)=> {
        if (err) {
            const err = new APIError('Something wrong', httpStatus.BAD_REQUEST, true);
            return next(err);
        }
        res.status(200).json({success: true, signUpCode: code});
    })
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
    invitationCode.save((err)=> {
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


export default {login, logout, verify, generateInvitationCode, removeInvitationCode, finalizeUser, socialAuth, preSignUp};
