import * as RODIN from 'https://cdn.rodin.io/v0.0.2/rodinjs/RODIN.js';
import 'https://cdn.rodin.io/v0.0.2/vendor/three/examples/js/loaders/OBJLoader.js';

import {SceneManager} from 'https://cdn.rodin.io/v0.0.2/rodinjs/scene/SceneManager.js';
import {ViveController} from 'https://cdn.rodin.io/v0.0.2/rodinjs/controllers/ViveController.js';



const scene = SceneManager.get();
let controls = scene.controls;

let controllerL = new ViveController(RODIN.CONSTANTS.CONTROLLER_HANDS.LEFT, scene, scene.camera, 2);
controllerL.standingMatrix = controls.getStandingMatrix();

SceneManager.addController(controllerL);
scene.add(controllerL);

let controllerR = new ViveController(RODIN.CONSTANTS.CONTROLLER_HANDS.RIGHT, scene, scene.camera, 3);
controllerR.standingMatrix = controls.getStandingMatrix();

SceneManager.addController(controllerR);
scene.add(controllerR);

let loader = new THREE.OBJLoader();
loader.setPath('./object/');
loader.load('vr_controller_vive_1_5.obj', function (object) {

  let loader = new THREE.TextureLoader();
  loader.setPath('./img/');

  object.children[0].material.map = loader.load('onepointfive_texture.png');
  object.children[0].material.specularMap = loader.load('onepointfive_spec.png');

  controllerL.add(object.clone());
  controllerR.add(object.clone());
});
