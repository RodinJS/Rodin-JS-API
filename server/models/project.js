import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

/**
 * Project Schema
 */
const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: {
    type: Array
  },
  picture: {
    type: String
  },
  root: {
    type: String,
    required: true,
  },
  build: {
    oculus: {
      type: Boolean
    },
    vive: {
      type: Boolean
    },
    daydream: {
      type: Boolean
    },
    gearvr: {
      type: Boolean
    },
    ios: {
      type: Boolean
    },
    android: {
      type: Boolean
    }
  },
  type: {
    type: String
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

/**
 * Statics
 */
ProjectSchema.statics = {
  /**
   * Get project by id
   * @param {ObjectId} id - The objectId of project.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findOne({id: new RegExp('^' + id + '$', "i")})
      .execAsync().then((project) => {
        if (project) {
          return project;
        }
      })
      .error((e) => {
        const err = new APIError('No such project exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err)
      });
  },

  /**
   * List projects in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of projects to be skipped.
   * @param {number} limit - Limit number of projects to be returned.
   * @returns {Promise<Project[]>}
   */
  list({skip = 0, limit = 50} = {}) {
    return this.find()
      .sort({createdAt: -1})
      .skip(skip)
      .limit(limit)
      .execAsync();
  }
};

ProjectSchema.pre("save", function (next) {
  let project = this;
  function generateProjectRoot(i, callback) {
    if (i !== 0) {
      project.root += i;
    } else {
      project.root = project.name.replace(/ /g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    project.constructor.count({root: project.root}, (err, count) => {
      if (err) {
        return callback(err);
      } else if (count > 0) {
        return generateProjectRoot(++i, callback);
      }
      return callback();
    });
  }

  if (project.isNew) {
    return generateProjectRoot(0, next);
  } else {
    return next();
  }
});

ProjectSchema.methods.outcome = function () {
  let project = this;
  return {
    _id: project._id,
    name: project.name,
    owner: project.owner,
    root: project.root,
    picture: project.picture,
  }
};


/**
 * @typedef User
 */
export default mongoose.model('Project', ProjectSchema);