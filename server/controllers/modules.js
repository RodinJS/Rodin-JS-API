import _ from 'lodash';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import Modules from '../models/modules';
import AssignedModules from '../models/assignedModules';
import ModulesSubscribe from '../models/modulesSubscribe';


function list(req, res, next){
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;

  Modules.list({limit, skip}, req.query._queryString).then((modules) => {
    res.status(200).json({
      success: true,
      data: modules
    })
  })
    .error((e) => next(e));
}

function getById(req, res, next){
  const moduleID = req.body.moduleId || req.query.moduleId || req.param.moduleId;
  console.log(moduleID);
  Modules.getById(moduleID)
    .then(module=>{
      req.module = module;
      return next();
    })
    .catch(err=>onError(err, next))
}

function create(req, res, next){

  if(_.isUndefined(req.body.title)){
    const err = new APIError('Provide module title', 400, true);
    return next(err);
  }

  if(_.isUndefined(req.body.description)){
    const err = new APIError('Provide module title', 400, true);
    return next(err);
  }

  const savingData = _.pick(req.body, ['title', 'description', 'thumbnail', 'author', 'exampleLink', 'documentationLink']);

  let module = new Modules(savingData);

  module.saveAsync()
    .then((createdModule)=>{
      res.status(200).json({success:true, data:createdModule});
    })
    .catch( err=> onError(err, next))

}

function subscribe(req, res, next){
  let subscribeModule = new ModulesSubscribe({
    moduleId:req.module._id,
    owner:req.user.username
  });

  subscribeModule.saveAsync()
    .then((subscribedModule)=>{
      res.status(200).json({success:true, data:subscribedModule});
    })
    .catch( err=> onError(err, next))

}

function onError(e, next){
  console.log(e);
  const err = new APIError("Bad request", httpStatus.BAD_REQUEST, true);
  return next(err);
}

export default { list, getById, create, subscribe};
