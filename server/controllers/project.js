import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import Project from '../models/project';
import ProjectTemplates from '../models/projectTemplate';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import help from '../helpers/editor';
import request from 'request';
import config from '../../config/env';
import fsExtra from 'fs-extra';
import utils from '../helpers/common';
import userCapacity from '../helpers/directorySize';
import  _ from 'lodash';


const getStatus = (project, device, cb) => {
    console.log(JSON.stringify(project, null, 3));
    request.get(
        {
            url: `${config[device].urls.getStatus}/${project.build[device].buildId}`,
            headers: {
                'app-id': config[device].appId,
                'app-secret': config[device].appSecret
            }
        },
        (err, httpResponse, body) => {
            // console.log("1", err);
            // console.log("2", httpResponse);
            console.log("3", body);
            if (err || httpResponse.statusCode !== 200) {
                project.build[device].built = false;
                return project.save(err => cb(err, project));
            }

            project.build[device].built = JSON.parse(body).data.buildStatus;
            return project.save(err => cb(err, project));
        }
    )
};

/**
 * Get project
 * @returns {Project}
 */
function get(req, res, next) {
    Project.getOne(req.params.id, req.user.username)
        .then((project) => {
            if (project) {
                if (req.query.device) {
                    return getStatus(project, req.query.device, (err, project) => {
                        res.status(200).json({
                            success: true,
                            data: project
                        });
                    })
                }
                //TODO normalize root folder path
                let response = {
                    "success": true,
                    "data": project
                };
                if(req.query.projectSize) {
                    req.project = project.toObject();
                    return next();
                }
                else{
                    return res.status(200).json(response);
                }
            } else {
                const err = new APIError('Project is empty', httpStatus.NOT_FOUND, true);
                return next(err);
            }
        })
        .catch((e) => {
            Project.getByName(req.params.id, req.user.username)
                .then((project) => {
                    if (project) {
                        if (req.query.device) {
                            return getStatus(project, req.query.device, (err, project) => {
                                res.status(200).json({
                                    success: true,
                                    data: project
                                });
                            })
                        }
                        //TODO normalize root folder path
                        let response = {
                            "success": true,
                            "data": project
                        };

                        if(req.query.projectSize) {
                            req.project = project.toObject();
                            return next();
                        }
                        else
                            return res.status(200).json(response);
                    } else {
                        const err = new APIError('Project is empty', httpStatus.NOT_FOUND, true);
                        return next(err);
                    }
                })
                .catch((e) => {
                    const err = new APIError('Project not found', httpStatus.NOT_FOUND, true);
                    return next(e);
                });
        });
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
        owner: req.user.username,
        description: req.body.description,
        isNew: true
    });

    project.saveAsync()

        .then((savedProject) => {

            let project = savedProject.toObject();

            let rootDir = 'projects/' + req.user.username + '/' + project.root;

            if (!fs.existsSync(rootDir)) {

                fs.mkdirSync(rootDir); //creating root dir for project

                if (req.body.templateId) {

                    ProjectTemplates.getOne(req.body.templateId).then((templateProject)=> {

                        if (templateProject) {

                            templateProject = templateProject.toObject();

                            let templateDir = 'resources/templates/' + templateProject.root;

                            // Check template exist
                            if (fs.existsSync(templateDir)) {

                                //copy tempate
                                fsExtra.copy(templateDir, rootDir, function (err) {
                                    if (err)
                                        fs.appendFileSync(rootDir + '/error.log', err + '\n');
                                    else {
                                        Project.updateAsync(
                                            {
                                                _id: project._id,
                                                owner: req.user.username
                                            },
                                            {
                                                $set: {
                                                    updatedAt: new Date(),
                                                    templateOf: templateProject.name

                                                }
                                            }
                                        ).then(result => {
                                            })
                                            .catch((e) => {
                                                fs.appendFileSync(rootDir + '/error.log', e + '\n');
                                            });
                                    }

                                });

                            }
                            else {
                                fs.appendFileSync(rootDir + '/error.log', 'Template not exist' + '\n');
                            }
                        }
                        else {
                            fs.appendFileSync(rootDir + '/error.log', 'Template not exist' + '\n');
                        }

                    });
                }

            }

            User.get(req.user.username)
                .then(user => {
                    if (user) {
                        User.updateAsync({username: req.user.username}, {
                                $push: {
                                    "projects": savedProject._id
                                }
                            })
                            .then(updatedUser => {
                                return res.status(201).json({
                                    "success": true,
                                    "data": savedProject.outcome()
                                });
                            })
                            .catch((e) => {
                                const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                                return next(err);
                            });
                    } else {
                        const err = new APIError('User not found!', 310);
                        return next(err);
                    }

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
    req.body.updatedAt = new Date();

    Project.updateAsync(
        {
            _id: req.params.id,
            owner: req.user.username
        },
        {
            $set: req.body
        })
        .then(result => {
            if (result.nModified === 1) {
                return res.status(200).json({
                    "success": true,
                    "data": {}
                });
            } else {
                const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                return next(err);
            }
        })
        .catch((e) => {
            const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
            return next(err);
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
    Project.list({limit, skip}, req.user.username, req.query._queryString).then((projects) => {
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
    const id = req.params.id;
    const username = req.user.username;
    User.getPermission(username, id)
        .then(user => {
            if (user) {
                Project.removeAsync({_id: id})
                    .then((deletedProject) => {
                        if (deletedProject.result.ok === 1) {
                            User.updateAsync(
                                {
                                    username: username
                                },
                                {
                                    $pull: {
                                        projects: id
                                    }
                                }
                                )
                                .then(updatedUser => {
                                    return res.status(200).json({
                                        "success": true,
                                        "data": "Project Successfuly deleted!"
                                    });
                                });
                        } else {
                            const err = new APIError("Something went wrong!", 312, true);
                            return next(err);
                        }
                    }).error((e) => next(e));
            } else {
                const err = new APIError('User has no permission to modify this project!', 310, true);
                return next(err);
            }

        });
}

/**
 * Make user project public
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function makePublic(req, res, next) {
    if (!req.params.id) {
        const err = new APIError('Provide project ID!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
        return next(err);
    }

    if (!req.body.status) {
        const err = new APIError('Provide project status!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
        return next(err);
    }


    const id = req.params.id;
    const username = req.user.username;
    const status = req.body.status;
    Project.getOne(id, username)
        .then(project => {

            if (project) {
                Project.updateAsync(
                    {
                        _id: req.params.id
                    },
                    {
                        $set: {
                            "public": status
                        }
                    }
                    )
                    .then(updatedProject => {
                        if (updatedProject.nModified === 1) {
                            if (status === 'true') {
                                const srcDir = path.join(__dirname, '..', '..', '..', 'projects', username, help.cleanUrl(project.root));
                                // const srcDir = `/var/www/${req.hostname}/projects/${username}/${help.cleanUrl(project.root)}`;
                                const publicDir = path.join(__dirname, '..', '..', '..', 'public', username, help.cleanUrl(project.root));
                                // const publicDir = '/var/www/api.rodinapp.com/public/' + username + '/' + help.cleanUrl(project.root);
                                const ter = 'ln -s ' + srcDir + ' ' + publicDir;
                                const code = execSync(ter);
                                return res.status(200).json({
                                    "success": true,
                                    "data": {publicDir}
                                });

                            } else {
                                const publicDir = path.join(__dirname, '..', '..', '..', 'public', username, help.cleanUrl(project.root));
                                // const publicDir = '/var/www/api.rodinapp.com/public/' + username + '/' + help.cleanUrl(project.root);
                                if (fs.existsSync(publicDir)) {
                                    fs.unlinkSync(publicDir);
                                    return res.status(200).json({
                                        "success": true,
                                        "data": {publicDir}
                                    });
                                } else {
                                    const err = new APIError('link exist!', httpStatus.BAD_REQUEST, true);
                                    return next(err);
                                }

                            }
                        } else {
                            const err = new APIError('Can\'t update info--', httpStatus.BAD_REQUEST, true);
                            return next(err);
                        }
                    }).catch(e => {
                    console.log(e)
                    const err = new APIError('Can\'t update info++', httpStatus.BAD_REQUEST, true);
                    return next(e);
                });
            } else {
                const err = new APIError('Project not found!', 310, true);
                return next(err);
            }
        });
}

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 *
 * Publish user project
 */
function publishProject(req, res, next) {

    let projectFolder = help.generateFilePath(req, '');
    let publishFolder = help.generateFilePath(req, '', 'publish');

    if (fs.existsSync(projectFolder)) {

        if (fs.existsSync(publishFolder)) {
            fsExtra.removeSync(publishFolder)
        }

        fsExtra.copy(projectFolder, publishFolder, function (err) {
            if (err) {
                const err = new APIError('Publishing error', httpStatus.BAD_REQUEST, true);
                return next(err);
            }

            Project.updateAsync({_id: req.params.id, owner: req.user.username}, {$set: {publishDate: new Date()}})
                .then(result => {
                    if (result.nModified === 1) {
                        return res.status(200).json({success: true, data: 'Project published'})
                    }
                    else {
                        const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                        return next(err);
                    }
                })
                .catch((e) => {
                    const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                    return next(err);
                });
        });

    }
    else {
        const err = new APIError('Project not found', httpStatus.NOT_FOUND, true);
        return next(err);
    }

}

/**
 * Unpublish user project
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function unPublishProject(req, res, next) {

    let publishFolder = help.generateFilePath(req, '', 'publish');

    if (fs.existsSync(publishFolder)) {
        fsExtra.removeSync(publishFolder);
        Project.updateAsync({_id: req.params.id, owner: req.user.username}, {$unset: {publishDate: 1}})
            .then(result => {
                if (result.nModified === 1) {
                    return res.status(200).json({success: true, data: 'Project unpublished'})
                }
                else {
                    const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                    return next(err);
                }
            })
            .catch((e) => {
                const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                return next(err);
            });
    }
    else {
        const err = new APIError('Published project does not exist', httpStatus.BAD_REQUEST, true);
        return next(err);
    }


}

function getProjectsCount(req, res, next) {
    if (!req.query.projectsCount) return next();
    let query = {
        $match: {
            owner: req.user.username
        }
    };
    let option = {
        $group: {
            _id: {$gt: ["$publishDate", null]},
            count: {$sum: 1}
        }
    };
    Project.aggregate(query, option)
        .then(projects=> {
            req.projectsCount = {};
            _.each(projects, (project)=> {

                if (!project._id)
                    req.projectsCount.unpublished = project.count;
                else
                    req.projectsCount.published = project.count;
            });
            next();
        })
        .catch((e)=> {
            console.log(e);
        })
}
/**
 *
 * @param req
 * @param res
 * @param next
 * Import templates data
 */
function importOnce(req, res, next) {

    const projects = utils.getDefTemplatesObject();

    ProjectTemplates.insert(projects, (response)=> {
        if (!response.success) {
            const err = new APIError('Inserting error', httpStatus.BAD_REQUEST, true);
            return next(err);
        }
        res.status(200).send({success: true});
    });
}

/**
 * Get project list.
 * @property {number} req.query.skip - Number of projects to be skipped.
 * @property {number} req.query.limit - Limit number of projects to be returned.
 * @returns {ProjectTemplate[]}
 */
function getTemplatesList(req, res, next) {
    const {limit = 50, skip = 0} = req.query;
    ProjectTemplates.list({limit, skip}).then((projects) => {
        res.status(200).json({
            success: true,
            data: projects
        })
    }).error((e) => {
        const err = new APIError('Bad request', httpStatus.BAD_REQUEST, true);
        return next(err);
    });
}

function getProjectSize(req, res, next){
    if(!req.query.projectSize) return next();
    let rootDir = 'projects/' + req.user.username+'/'+req.project.root;

    userCapacity.readSizeRecursive(rootDir, (err, size)=>{
        size = err ? 0 : size;

        req.project.projectSize = utils.byteToMb(size);

        let response = {
            "success": true,
            "data": req.project
        };
        return res.status(200).json(response);
    });
}

export default {
    get,
    create,
    update,
    list,
    remove,
    makePublic,
    publishProject,
    unPublishProject,
    importOnce,
    getTemplatesList,
    getProjectsCount,
    getProjectSize
};
