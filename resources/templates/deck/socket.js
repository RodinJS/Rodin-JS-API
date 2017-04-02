//Created by xgharibyai
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager';
import {EVENT_NAMES} from 'https://cdn.rodin.io/v0.0.1/rodinjs/constants/constants';
import {screen} from './objects/screen.js';
import * as Characters from './objects/characters.js';
import {env} from './objects/index.js';


let initialPositions = [
    {x:-1,  y:0, z:-1},
    {x:1,  y:0, z:-1},
    {x:2, y:0, z:-1},
    {x:3, y:0, z:-1},
    {x:4, y:0, z:-1},
    {x:-2, y:0, z:-1},
    {x:-3, y:0, z:-1},
];


const activeUsers = {};

const scene = SceneManager.get();
const SS = new RodinSocket();


screen.on(EVENT_NAMES.CONTROLLER_KEY_UP, (evt) => {
   SS.broadcastToAll('changeMode', {});
});

SS.connect({});

SS.onConnected((data)=> SS.getConnectedUsersList());

SS.onMessage('socketDisconnected', (data)=>scene.scene.remove(activeUsers[data.socketId]));

SS.onMessage('changeMode', (data)=>{
    if(env.mode === 'light') {
       env.enterDarkMode();
       SS.setData({darkMode:true});
   }
});

SS.onMessage('renderPerson', (data)=>{
    if(data.socketId != SS.Socket.id)
        renderMan(initialPositions[data.coordinateIndex], data.socketId);

    let interval = setInterval(()=>{
       let cameraDirection = scene.camera.getWorldDirection();
       let angle = Characters.getAngle(new THREE.Vector2(0,0), new THREE.Vector2(cameraDirection.x, cameraDirection.z));
       SS.broadcastToAll('changeUserCoordinates', {rotation:(Math.PI/2)-angle, socketId:SS.Socket.id});
    }, 50);
});

SS.onMessage('changeUserCoordinates', (data)=>{
    if(activeUsers[data.socketId])
        activeUsers[data.socketId].rotation.y = data.rotation;  
});

SS.onMessage('changeMainPicture', (data)=>{
    
    if(data.socketId != SS.Socket.id)
        screen.show(data.imageIndex);
});

SS.onMessage('getConnectedUsersList', (data)=>{
    for (let i = 0; i < data.length; i++){
        if(!isNaN(data[i].positionIndex)){
            const socket = data[i].socketId;
            initialPositions[data[i].positionIndex].id = data[i].socketId;
            renderMan(initialPositions[data[i].positionIndex], socket);
        }
    }
    let firstFreePosition = initialPositions.findIndex((position)=> !position.id);
    let findPresentaionImageState = data.find((user)=> user.imageIndex);
    let findEnteredDarkMode = data.find((user)=> user.darkMode);
    
    if(findEnteredDarkMode){
        env.enterDarkMode();
        SS.setData({darkMode:true});
    }    
    
     if(findPresentaionImageState){
        screen.unlock();
        screen.show(findPresentaionImageState.imageIndex);
        SS.setData({imageIndex:findPresentaionImageState.imageIndex});
    }
        
    SS.setData({positionIndex:firstFreePosition});
    SS.broadcastToAll('renderPerson', {coordinateIndex:firstFreePosition, socketId:SS.Socket.id});
});

screen.on('change', (evt) =>{
    if(SS.Socket){
        SS.setData({imageIndex:evt.target.currentIndex});
        SS.broadcastToAll('changeMainPicture', {imageIndex:evt.target.currentIndex, socketId:SS.Socket.id});
    }
});

function renderMan(position, socketId){
   const man  = Characters.createMan();
   man.on('ready', (evt)=>{
        evt.target.object3D.position.set(position.x, position.y, position.z);
        activeUsers[socketId] = evt.target.object3D;
        scene.add(evt.target.object3D);
   });
}

window.onbeforeunload = function(event){
   SS.disconnect();
};