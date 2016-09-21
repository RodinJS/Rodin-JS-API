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
		lowercase: true,
		unique: true,
		required: true
	},
	root: {
		type: String,
		required: true,
	},
	build: {
		oculus: {
			type: String
		},
		vive: {
			type: String
		},
		daydream: {
			type: String
		},
		gearvr: {
			type: String
		},
		ios: {
			type: String
		},
		android: {
			type: String
		}
	},
	type: {
		type: String
	},
	createdAt: {
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
		return this.findOne({ id: new RegExp('^'+id+'$', "i") })
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
	list({ skip = 0, limit = 50 } = {}) {
		return this.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.execAsync();
	}
};

/**
 * @typedef User
 */
export default mongoose.model('Project', ProjectSchema);
