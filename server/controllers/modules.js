import _ from 'lodash';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import Modules from '../models/modules';
import ModulesAssign from '../models/assignedModules';
import ModulesSubscribe from '../models/modulesSubscribe';
import config from '../../config/env';

function list(req, res, next) {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    Modules.list({ limit, skip }, req.query._queryString).then((modules) => {
        res.status(200).json({
            success: true,
            data: modules,
        });
    })
      .error((e) => next(e));
}

function getById(req, res, next) {
    const moduleID = req.body.moduleId || req.query.moduleId || req.param.moduleId;
    Modules.getById(moduleID)
      .then(module => {
        req.module = module;
        return next();
    })
      .catch(err => onError(err, next));
}

function getMyModules(req, res, next) {
    if (_.isUndefined(req.query.projectId)) {
        const err = new APIError('Provide project id', 400, true);
        return next(err);
    }

    ModulesSubscribe.getByOwner(req.user.username)
      .then(subscribedModules => {
        subscribedModules = subscribedModules.map(m => m.toObject());
        const subscribedModulesIds = subscribedModules.map(m => _.pick(m, ['moduleId']).moduleId);

        Modules.find({ _id: { $in: subscribedModulesIds } })
          .then(modules => {
            ModulesAssign.find({
                owner: req.user.username,
                moduleId: { $in: subscribedModulesIds },
            })
              .then(assignedModules => {

                const mappedModules = _.map(modules.map(m => m.toObject()), (module) => {
                    let assigned = _.filter(assignedModules, (m) => m.toObject().moduleId.toString() === module._id.toString());
                    if (assigned.length > 0) {
                        module.projects = _.map(assigned, (assign) => {
                            req.module = module;
                            let override = {
                                projectId: assign.projectId,
                                allowedHosts: assign.allowedHosts,
                                script: generateScript(req),
                            };
                            return override;
                        });
                    }

                    return module;
                });

                console.log(mappedModules);

                return onSuccess(mappedModules, res);
            })
              .catch(err => onError(err, next));
        })
          .catch(err => onError(err, next));
    })
      .catch(err => onError(err, next));
}

function create(req, res, next) {

    if (_.isUndefined(req.body.title)) {
        const err = new APIError('Provide module title', 400, true);
        return next(err);
    }

    if (_.isUndefined(req.body.description)) {
        const err = new APIError('Provide module title', 400, true);
        return next(err);
    }

    const savingData = _.pick(req.body, ['title', 'description', 'thumbnail', 'author', 'price', 'url', 'exampleLink', 'documentationLink']);

    let module = new Modules(savingData);

    module.saveAsync()
      .then((createdModule) => res.status(200).json({ success: true, data: createdModule }))
      .catch(err => onError(err, next));

}

function update(req, res, next) {
    if (_.isUndefined(req.body.allowedHosts) || _.isEmpty(req.body.allowedHosts)) {
        const err = new APIError('Provide allowed hosts', 400, true);
        return next(err);
    }

    if (_.isUndefined(req.body.projectId)) {
        const err = new APIError('Provide project id', 400, true);
        return next(err);
    }

    const query = { owner: req.user.username, projectId: req.body.projectId, moduleId: req.module._id };
    const update = { $set: { allowedHosts: req.body.allowedHosts } };

    ModulesAssign.findOneAndUpdate(query, update, { new: true })
      .then(assignedModule => onSuccess(assignedModule, res))
      .catch(err => onError(err, next));

}

function subscribe(req, res, next) {
    ModulesSubscribe.findOne({ moduleId: req.module._id, owner: req.user.username })
      .then(module => {
        if (module) {
            const err = new APIError(`Module already purchased`, httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        let subscribeModule = new ModulesSubscribe({
            moduleId: req.module._id,
            owner: req.user.username,
        });

        subscribeModule.saveAsync()
          .then(subscribedModule => onSuccess(subscribedModule, res))
          .catch(err => onError(err, next));
    })
      .catch(err => onError(err, next));

}

function checkIsSubscribed(req, res, next) {
    if (_.isUndefined(req.body.moduleId)) {
        const err = new APIError('Provide module id', 400, true);
        return next(err);
    }

    ModulesSubscribe.getModuleByIdAndOwner(req.body.moduleId, req.user.username)
      .then(module => next())
      .catch(err => onError(err, next));

}

function assignToProject(req, res, next) {
    if (_.isUndefined(req.body.allowedHosts) || _.isEmpty(req.body.allowedHosts)) {
        const err = new APIError('Provide allowed hosts', 400, true);
        return next(err);
    }

    if (_.isUndefined(req.body.projectId)) {
        const err = new APIError('Provide project id', 400, true);
        return next(err);
    }

    ModulesAssign.findOne({ owner: req.user.username, projectId: req.body.projectId, moduleId: req.module._id })
      .then(assignedModule => {
        if (assignedModule) {
            const err = new APIError(`Module already assigned`, httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        let assignModule = new ModulesAssign({
            owner: req.user.username,
            projectId: req.body.projectId,
            moduleId: req.module._id,
            allowedHosts: req.body.allowedHosts,
        });
        assignModule.save()
          .then(assignedModule => onSuccess(generateScript(req), res))
          .catch(err => onError(err, next));
    });

}

function generateScript(req) {
    const projectID = req.body.projectId || req.query.projectId || req.params.projectId;
    return `<script src="${config.modules.socketService.URL}/${req.module.url}?projectId=${projectID}&host=${config.modules.socketService.URL}"></script>`;
}

function onSuccess(data, res) {
    return res.status(200).json({ success: true, data: data });
}

function onError(e, next) {
    console.log(e);
    const err = new APIError(`Bad request`, httpStatus.BAD_REQUEST, true);
    return next(err);
}

export default { list, getById, create, subscribe, assignToProject, checkIsSubscribed, getMyModules, update };
