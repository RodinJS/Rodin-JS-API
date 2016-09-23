import Project from '../models/project';
import jwt from 'jsonwebtoken';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';

const config = require('../../config/env');

/**
 * Get project
 * @returns {Project}
 */
function get(req, res) {
  let response = {
    "success": true,
    "data": {
      email: req.project.email,
      username: req.project.username,
      role: req.project.role,
      profile: req.project.profile
    }
  };

  return res.status(200).json(response);
}

/**
 * Create new project
 * @property {string} req.body.name - The name of project.
 * @property {string} req.body.description - The description of project.
 * @property {Array} req.body.tags - The tags of project.
 * @returns {Project}
 */
function create(req, res, next) {

  let project = new Project({
    name: req.body.name,
    tags: req.body.tags,
    root: req.body.name,
    description: req.body.description,
    isNew: true
  });

  project.saveAsync()
    .then((savedProject) => {
      return res.status(201).json({
        "success": true,
        "data": savedProject.outcome()
      });
    })
    .error((e) => {
      const err = new APIError("Something went wrong!", 312, true);
      return next(e);
    });
}

/**
 * Update existing project
 * @property {string} req.body.email - The email of project.
 * @property {string} req.body.password - The password of project.
 * @returns {Project}
 */
function update(req, res, next) {
  let project = req.project;

  project.saveAsync()
    .then((savedProject) => {
      return res.status(201).json({
        "success": true,
        "data": savedProject.outcome()
      });
    })
    .error((e) => {
      const err = new APIError("Something went wrong!", 312, true);
      return next(e);
    });

}

/**
 * Get project list.
 * @property {number} req.query.skip - Number of projects to be skipped.
 * @property {number} req.query.limit - Limit number of projects to be returned.
 * @returns {Project[]}
 */
function list(req, res, next) {
  const {limit = 50, skip = 0} = req.query;
  Project.list({limit, skip}).then((projects) => {
    res.status(200).json({
      success: true,
      data: projects
    })
  })
    .error((e) => next(e));
}

/**
 * Delete project.
 * @returns {Project}
 */
function remove(req, res, next) {
  const project = req.project;
  project.status(200).removeAsync()
    .then((deletedProject) => {
      res.json({
        success: true
      })
    })
    .error((e) => next(e));
}

export default {get, create, update, list, remove};
