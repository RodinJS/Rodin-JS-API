import _ from 'lodash';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import Modules from '../models/modules';
import ModulesAssign from '../models/assignedModules';
import ModulesSubscribe from '../models/modulesSubscribe';
import Project from '../models/project';
import config from '../../config/env';
const HookSecretKey = 'K7rd6FzEZwzcc6dQr3cv9kz4tTTZzAc9hdXYJpukvEnxmbdB42V4b6HePs5ZDTYLW_4000dram_module';

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
                        let moduleInfo = _.find(subscribedModules, (subscribedModule) => subscribedModule.moduleId.toString() === module._id.toString());
                        module.unsubscribed = moduleInfo.unsubscribed;
                        module.expiredAt = moduleInfo.expiredAt;
                    }

                    return module;
                });

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

        if (module && !module.unsubscribed) {
            const err = new APIError(`Module already subscribed`, httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        //user unsubscribed but not exiperd
        if (module && module.unsubscribed && (new Date() < new Date(module.expiredAt))) {
            module.subscribedAt = new Date();
            module.expiredAt = (new Date(module.expiredAt).getTime() +  2629746000); // month
            module.unsubscribed = false;
            return module.save()
                .then(subscribedModule => onSuccess(subscribedModule, res))
                .catch(err => onError(err, next));
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

function unsubscribe(req, res, next) {

    ModulesSubscribe.findOneAndUpdate({
        moduleId: req.module._id,
        owner: req.user.username,
    }, { $set: { unsubscribed: true, unsubscrbedDate: new Date() } }, { new: true })
    //ModulesSubscribe.findOneAndRemove({ moduleId: req.module._id, owner: req.user.username })
      .then(unsubscribed => onSuccess(unsubscribed, res))
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

function validateModule(req, res, next) {
    ModulesAssign.get(req.query.projectId)
      .then(module => {
        if (!module)  return onError('M_N_A_C_P', next, 'Module not assigned to current project');

        module = module.toObject();

        ModulesSubscribe.getByOwnerAndModuleId(module.owner, module.moduleId)
          .then(subscribed=> {

            if (!subscribed) return onError('M_N_P', next, 'Module not purchased');

            subscribed = subscribed.toObject();
            if (new Date(subscribed.expiredAt) <= new Date())  return onError('S_E', next, 'Subscription expired');

            Project.get(req.query.projectId)
              .then(project=> {
                if (!project) return onError('M_N_S_F_H', next, 'Module not support following host');

                const allowedHosts = ['rodin.space', 'rodin.io', 'rodin.design', 'localhost'];
                project = project.toObject();

                if (project.domain)
                  allowedHosts.push(project.domain);

                const hostname = _extractDomain(req);
                if (!hostname || _.indexOf(allowedHosts, hostname) < 0) return onError('M_N_S_F_H', next, 'Module not support following host');

                req.module = module;
                return onSuccess({ success: true }, res);

            })
              .catch((err) =>  onError(err, next, 'Module not support following host'));

        });

    }).catch((err) =>  onError(err, next, 'Module not purchased'));
}

function checkHookToken(req, res, next) {
    const token = req.headers['x-access-token'];

    if (token !== HookSecretKey) {
        const err = new APIError('Hook key invalid!', httpStatus.UNAUTHORIZED, true);
        return next(err);
    }

    next();
}

function onSuccess(data, res) {
    return res.status(200).json({ success: true, data: data });
}

function onError(e, next, message) {
    console.log(e);
    const err = new APIError(message || `Bad request`, httpStatus.BAD_REQUEST, true);
    return next(err);
}

/**
 *
 * @param req
 * @returns {*}
 * @private
 */
function _extractDomain(req) {
    const url = req.headers.referer;
    let domain = '';
    if (!url) {
        return false;
    }

    if (url.indexOf('://') > -1)
      domain = url.split('/')[2];
    else
      domain = url.split('/')[0];

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

export default {
    list,
    getById,
    create,
    subscribe,
    assignToProject,
    checkIsSubscribed,
    getMyModules,
    update,
    unsubscribe,
    validateModule,
    checkHookToken,
};
