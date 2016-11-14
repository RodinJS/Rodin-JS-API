import User from '../models/user';
import InvitationCode from '../models/invitationCode';
import jwt from 'jsonwebtoken';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

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
                                    profile: user.profile
                                }
                            }
                        });
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
 * Handling user info from social network login.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function socialLogin(req, res, next) {
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
                profile: user.profile
            }
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


export default {login, logout, verify, generateInvitationCode, removeInvitationCode, socialLogin};
