import ProjectTemplate from '../models/projectTemplate';

/**
 * Get project list.
 * @property {number} req.query.skip - Number of projects to be skipped.
 * @property {number} req.query.limit - Limit number of projects to be returned.
 * @returns {ProjectTemplate[]}
 */
function list (req, res, next) {
  const {limit = 50, skip = 0} = req.query;
  ProjectTemplate.list({limit, skip}).then((projects) => {
    res.status(200).json({
      success: true,
      data: projects
    })
  }).error((e) => next(e));
}

export default {list};
