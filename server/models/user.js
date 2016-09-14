import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import bcrypt from 'bcrypt-nodejs';

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Free', 'Premium', 'Admin'],
    default: 'Free'
  },
  profile: {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  facebookId: {
    type: String
  },
  googleId: {
    type: String
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre('save', function(next) { // eslint-disable-line
  const user = this;
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
        if (err) { return reject(err); }
        resolve(isMatch);
      });
    });
  }
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
  get(id) {
    return this.findById(id)
      .execAsync().then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get user by email
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  getByEmail(email) {
    return this.findOne({ email: new RegExp('^'+email+'$', "i") }) // eslint-disable-line
      .execAsync().then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
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
  }
};

/**
 * @typedef User
 */
export default mongoose.model('User', UserSchema);
