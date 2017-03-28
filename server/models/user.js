// jscs:disable validateIndentation
import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';
import bcrypt from 'bcrypt-nodejs';

/**
 * User Schema
 */

const editorTemplates = ['chrome',
	'clouds',
	'crimson_editor',
	'dawn',
	'dreamweaver',
	'eclipse',
	'github',
	'iplastic',
	'solarized_light',
	'textmate',
	'tomorrow',
	'xcode',
	'kuroir',
	'katzenmilch',
	'sqlserver',
	'ambiance',
	'chaos',
	'clouds_midnight',
	'cobalt',
	'idle_fingers',
	'kr_theme',
	'merbivore',
	'merbivore_soft',
	'mono_industrial',
	'monokai',
	'pastel_on_dark',
	'solarized_dark',
	'terminal',
	'tomorrow_night',
	'tomorrow_night_blue',
	'tomorrow_night_bright',
	'tomorrow_night_eighties',
	'twilight',
	'vibrant_ink',
];

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    role: {
        type: String,
        enum: ['Free', 'Premium', 'Enterprise', 'Admin', 'God'],
        default: 'Free',
        required: true,
    },
    allowProjectsCount: {
        type: Number,
        enum: [2, 5, 10],
        default: 2,

    },
    storageSize: {
        type: Number,
        enum: [100, 1000, 5000],
        default: 100,
    },
    profile: {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        city: String,
        about: String,
        website: String,
    },
    projects: [
     {
        type: String,
    },
    ],
    cert: {
        ios: {
            p12: {
                type: String,
            },
            profile: {
                type: String,
            },
        },
        android: {
            type: String,
        },
    },
    type: {
        type: String,
        enum: ['User', 'Organization'],
        default: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    github: {
        id: { type: String },
        token:  { type: String },
        email: { type: String },
    },
    facebook: {
        id: { type: String },
        email: { type: String },
    },
    google: {
        id: { type: String },
        email: { type: String },
    },
    steamId: {
        type: String,
    },
    oculusId: {
        type: String,
    },
    editorSettings: {
        theme: {
            name: {
                type: String,
                enum: editorTemplates,
                default: 'chrome',
            },
        },
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    usernameConfirmed: {
        type: Boolean,
    },
    stripe: {
        customerId: String,
        subscriptionId: String,
    },
    invitationCode:{
      type:String
    }
});

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre('save', function (next) { // eslint-disable-line
    const user = this;// jscs:ignore safeContextKeyword
    const SALT_FACTOR = 5;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, (err, hash) => { // eslint-disable-line
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

/**
 * Methods
 */
UserSchema.method({
    // Method to compare password for login
    comparePassword(candidatePassword) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
                if (err) {
                    return reject(err);
                }

                resolve(isMatch);
            });
        });
    },
});

/**
 * Statics
 */
UserSchema.statics = {
    /**
     * Get user by id
     * @param {ObjectId} id - The objectId of user.
     * @returns {Promise<User, APIError>}
     */

    get(username) {

        username = username.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        return this.findOne({ username: new RegExp('^' + username + '$', 'i') })
         .execAsync().then((user) => {
            if (user) {
                return user;
            }

        })
         .error((e) => {
            const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
            return Promise.reject(err);
        });
    },

    /**
     * Check if user has permission to modify project
     * @param {ObjectId} id - The objectId of user.
     * @returns {Promise<User, APIError>}
     */
    getPermission(username, id) {
        username = username.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        return this.findOne({ username: new RegExp('^' + username + '$', 'i') }) // eslint-disable-line
         .execAsync().then((user) => {
            if (user) {
                for (let i = 0; i < user.projects.length; i++) {
                    console.log('----- ', i, ' ---- ', user.projects[i]);
                    if (user.projects[i] === id) {
                        return true;
                    }
                }

                return false;
            } else {
                return false;
            }
        })
         .error((e) => {
            const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
            return Promise.reject(err);
        });
    },

    /**
     * List users in descending order of 'createdAt' timestamp.
     * @param {number} skip - Number of users to be skipped.
     * @param {number} limit - Limit number of users to be returned.
     * @returns {Promise<User[]>}
     */
    list({ skip = 0, limit = 50 } = {}) {
        return this.find()
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit)
         .execAsync();
    },
};

/**
 * @typedef User
 */
export default mongoose.model('User', UserSchema);
