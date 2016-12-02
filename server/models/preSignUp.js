import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

/**
 * Project Schema
 */
const preSignUpSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    source: {
        type: String,
        enum: ['steam', 'oculus'],
        required: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    }

});

preSignUpSchema.statics = {


    get(code) {
        return this.findOne({code: code})  //new RegExp('^' + id + '$', "i")
            .execAsync().then((preUser) => {
                if (preUser) {
                    return preUser;
                } else {
                    const err = new APIError('No such code exists!----', httpStatus.NOT_FOUND, true);
                    return Promise.reject(err);
                }
            })
            .error((e) => {
                const err = new APIError('No such code exists!', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    },

    delete(code){
        return this.removeAsync({code: new RegExp('^' + code + '$', "i")})
            .then((preUser) => {
                if (preUser) {
                    return preUser;
                }

            })
            .error((e) => {
                const err = new APIError('No such pre sign up code exists!', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    }

};

export default mongoose.model('preSignUp', preSignUpSchema);
