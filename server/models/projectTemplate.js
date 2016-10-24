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
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  thumbnail: {
    type: String
  },
  root: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProjectTemplatesSchema.pre("save", (cb) => {
  if (this.isNew) {
    this.createdAt = Date.now();
  }

  this.updatedAt = Date.now();
  this.schema.findOne({
    name: this.name
  }).then((project, cb) => {
    if (project) {
      return cb(new Error('Project Exists'));
    }
    return cb();
  }).catch(cb);
});

ProjectTemplatesSchema.statics = {
  insert(project, cb) {
    return this.update(
      {
        name: project.name
      },
      {
        $set: project
      },
      {
        upsert: true
      },
      cb
    );
  },

  list({skip = 0, limit = 50} = {}) {
    return this.find({})
      .sort({createdAt: -1})
      .skip(skip)
      .limit(limit)
      .execAsync();
  }
};

export default mongoose.model('ProjectTemplates', ProjectTemplatesSchema);
