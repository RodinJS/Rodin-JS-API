import mongoose from 'mongoose';
import Promise from 'bluebird';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * CardBoard Schema
 */
const cardboardSchema = new mongoose.Schema({
  
  url: { 
    type: String, 
    required: true 
  },
  encoded: { 
    type: String, 
    required: true 
  },
  cardboard: {
    vendor: {
      type: String
    },
    model: {
      type: String
    },
    screen_to_lens_distance: {
      type: Number
    },
    inter_lens_distance: {
      type: Number
    },
    left_eye_field_of_view_angles: {
      type: Array
    },
    vertical_alignment: {
      type: Number
    },
    tray_to_lens_distance: {
      type: Number
    },
    distortion_coefficients: {
      type: Array
    },
    has_magnet: {
      type: Boolean
    },
    primary_button: {
      type: Number
    }
  }
});

/**
 * @typedef CardBoard
 */
export default mongoose.model('Cardboard', cardboardSchema);
