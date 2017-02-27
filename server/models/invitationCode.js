import mongoose from 'mongoose';
import Promise from 'bluebird';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

/**
 * CardBoard Schema
 */
const invitationCodeSchema = new mongoose.Schema({

/*    email: {
        type: String,
        //required: true,
        unique: true,
    },*/
    invitationCode: {
        type: String,
        required: true,
        unique: true,
    },
    creationDate: {
        type: Date,
        required: true,
        default: Date.now,
    },

});


/**
 * Statics
 */
invitationCodeSchema.statics = {
    /**
     * Get invitaionCode by requested code
     * @param {String} invitaionCode - The invitaionCode.
     * @returns {Promise<User, APIError>}
     */
    get(invitationCode) {
        return this.findOne({ invitationCode: new RegExp('^' + invitationCode + '$', 'i') })
            .execAsync().then((code) => {
                if (code) {
                    return code;
                }

            })
            .error((e) => {
                const err = new APIError('No such invitaion code exists!', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    },

    delete(invitationCode) {
        return this.removeAsync({ invitationCode: new RegExp('^' + invitationCode + '$', 'i') })
            .then((user) => {
                if (user) {
                    return user;
                }

            })
            .error((e) => {
                const err = new APIError('No such invitaion code exists!', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    },
};

/**
 * @typedef InvitationCode
 */
export default mongoose.model('InvitationCode', invitationCodeSchema);
