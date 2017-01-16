import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/**
 * Project Schema
 */
const purchasedModulesSchema = new mongoose.Schema({

    moduleId: {
        type: ObjectId,
        required: true
    },
    projectId: {
        type: ObjectId,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    allowedHosts:{
        type: Array,
        required: true,
    }

});

purchasedModulesSchema.statics = {

    get(projectId) {
        return this.findOne({projectId:mongoose.Types.ObjectId(projectId)}).execAsync()
            .then((module) => {
                if (module) {
                    return module;
                }
                else {
                    const err = new APIError('No such project exists!----', httpStatus.NOT_FOUND, true);
                    return Promise.reject(err);
                }
            })
            .catch((e) => {
                const err = new APIError('No such project exists!', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    },

    delete(code){

    }

};

export default mongoose.model('AssignedModules', purchasedModulesSchema);
