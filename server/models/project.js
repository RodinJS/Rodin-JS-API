import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Project Schema
 */
const ProjectSchema = new mongoose.Schema({
	name: {
		type: String
	},
	rootdir: {
		type: String
	},
	type: {
		type: String
	},
	buildfor: {
		android: {
			type: Boolean
		},
		ios: {
			type: Boolean
		},
		daydream: {
			type: Boolean
		},
		gearvr: {
			type: Boolean
		},
		oculus: {
			type: Boolean
		},
		vive: {
			type: Boolean
		},
		playstation: {
			type: Boolean
		},
	},
	owner: { 
		type: Schema.Types.ObjectId, 
		ref: 'User',
		required: 'Project must have an owner.'
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});


/**
 * @typedef Project
 */
export default mongoose.model('Project', ProjectSchema);

//.populate('postedBy')