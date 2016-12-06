/**
 * Created by xgharibyan on 12/6/16.
 */


import apiSockets from './apiSocket';

function push(req, res, next){

  const activeUser = apiSockets.Service.io.findUser(req.body.username);

  if (activeUser) {
    apiSockets.Service.io.broadcastToRoom(req.body.username, req.body.event, req.body);
    res.status(200).json({success:true, data:`Socket pushed to ${req.body.username}`})
  }
  else{
    res.status(400).json({success:false, data:`${req.body.username} not connected to socket`});
  }

}


export  default {push}
