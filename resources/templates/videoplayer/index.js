import {THREE} from 'https://cdn.rodin.space/vendor/three/THREE.GLOBAL.js';
import * as RODIN from 'https://cdn.rodin.space/rodinjs/RODIN.js';
import {SceneManager} from 'https://cdn.rodin.space/rodinjs/scene/SceneManager.js';
import {MouseController} from 'https://cdn.rodin.space/rodinjs/controllers/MouseController.js';
import {CardboardController} from 'https://cdn.rodin.space/rodinjs/controllers/CardboardController.js';
import {OculusController} from 'https://cdn.rodin.space/rodinjs/controllers/OculusController.js';
import {MaterialPlayer} from 'https://cdn.rodin.space/rodinjs/video/MaterialPlayer.js';
import {VPcontrolPanel} from './VPcontrolPanel.js';
import 'https://cdn.rodin.space/rodinjs/utils/Math.js';


let scene = SceneManager.get();
let camera = scene.camera;
let controls = scene.controls;
let renderer = scene.renderer;
let mouseController = new MouseController();
let oculusController = new OculusController();
let cardboardController = new CardboardController();

SceneManager.addController(mouseController);
SceneManager.addController(oculusController);
SceneManager.addController(cardboardController);

scene.setCameraProperty("far", 350);
scene.setCameraProperty("fov", 70);

let player = new MaterialPlayer({
    HD: "video/rodin4k.mp4",
    SD: "video/rodin2k.mp4",
    default: "HD"
});

let material = new THREE.MeshBasicMaterial({
    map: player.getTexture()
});


let sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(300, 720, 4), material);
sphere.scale.set(1, 1, -1);
sphere.rotation.y = Math.PI/2;
scene.add(sphere);

scene.preRender(function () {
    player.update(RODIN.Time.deltaTime());
});

let controlPanel = new VPcontrolPanel({
    player : player,
    title: "A sample 360° video",
    cover: "img/rodin.jpg",
    distance: 3,
    width: 3,
    controllers: [mouseController, oculusController, cardboardController]
});

controlPanel.on('ready', (evt) => {
    scene.add(evt.target.object3D);
    evt.target.object3D.position.y = controls.userHeight;
    if(evt.target.coverEl){
        evt.target.coverEl.rotation.y = -Math.PI/2;
    }
});