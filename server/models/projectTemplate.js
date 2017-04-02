import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

/**
 * Project Schema
 */
const ProjectTemplatesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    tags: [{
        type: String,
    },],
    thumbnail: {
        type: String,
    },
    root: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

ProjectTemplatesSchema.pre('save', (cb) => {
    if (this.isNew) {
        this.createdAt = Date.now();
    }

    this.updatedAt = Date.now();

    this.schema.findOne({
        name: this.name,
    }).then((project, cb) => {
        if (project) {
            return cb(new Error('Project Exists'));
        }

        return cb();
    }).catch(cb);

});

ProjectTemplatesSchema.statics = {

    getOne(id) {
        return this.findOne({ _id: id })  //new RegExp('^' + id + '$', "i")
            .execAsync().then((project) => {
                if (project) {
                    return project;
                } else {
                    const err = new APIError('No such project exists!----', httpStatus.NOT_FOUND, true);
                    return Promise.reject(err);
                }
            })
            .error((e) => {
                const err = new APIError('No such project exists!', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    },

    insert(projects, cb) {

        let bulk = this.collection.initializeUnorderedBulkOp();
        for (let i = 0; i < projects.length; i++) {
            bulk.find({ name: projects[i].name }).upsert().update({ $set: projects[i] });
        }

        bulk.execute((err)=> {
            if (err) {
                return cb(new Error('Saving error'));
            }

            return cb({ success: true });
        });
    },

    list({ skip = 0, limit = 50 } = {}) {
        return this.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .execAsync();
    },
};

export default mongoose.model('ProjectTemplates', ProjectTemplatesSchema);
