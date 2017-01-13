import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL.js';

import * as RODIN from 'https://cdn.rodin.io/v0.0.1/rodinjs/RODIN.js';

import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager.js';

import {CubeObject} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/CubeObject.js';

import {MouseController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/MouseController.js';

import {Socket} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sockets/Socket.js';


let scene = SceneManager.get();
let mouseController = new MouseController();
SceneManager.addController(mouseController);

let socket = new Socket();

// let skybox = new CubeObject(15, 'img/boxW.jpg');
// skybox.on('ready', (evt) => {
//     scene.add(evt.target.object3D);
//     evt.target.object3D.position.y = scene.controls.userHeight;
// });

let users = [];

let player = new RODIN.THREEObject(new THREE.Object3D());
player.on('ready', (evt) => {
    evt.target.object3D.position.set(Math.randomIntIn(-2, 2), 0, Math.randomIntIn(-2, 2));
    scene.add(evt.target.object3D);
    evt.target.object3D.add(scene.camera);
    connect(evt.target.object3D.position);
});

socket.on('newConnection', (data) => {
    for (let i = 0; i < users.length; ++i) {
        if (users[i].socketId === data.data.socketId) {
            return;
        }
    }

    let user = data.data;
    let cube = new RODIN.THREEObject(new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), new THREE.MeshBasicMaterial({color: 0x336699})));
    cube.on('ready', () => {
        console.log(data);
        cube.object3D.position.copy(data.data.position);
        scene.add(cube.object3D);
        user.model = cube;
        users.push(user);
    })
});

function connect (pos) {
    let username = prompt('Please enter your name', '');
    socket.username = username;
    socket.emit('subscribe', { roomId: 'myFirstApp', username: username, position: pos });
}
