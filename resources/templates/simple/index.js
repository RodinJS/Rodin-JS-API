import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL.js';
import * as RODIN from 'https://cdn.rodin.io/v0.0.1/rodinjs/RODIN.js';
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager.js';
import {CubeObject} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/CubeObject.js';
import {MouseController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/MouseController.js';

let scene = SceneManager.get();
let mouseController = new MouseController();
SceneManager.addController(mouseController);

var loader = new THREE.TextureLoader();
loader.load('img/boxW.png', (texture) => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);

  let geometry = new THREE.BoxGeometry(10, 10, 10);
  let material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide
  });
  let skybox = new THREE.Mesh(geometry, material);
  skybox.position.y = 1.7;
  scene.add(skybox);
});

let geometry = new THREE.BoxGeometry(0.015, 0.015, 0.015);
let material = new THREE.MeshNormalMaterial();

for (let i = 0; i < 1000; i++) {
  let cube = new RODIN.THREEObject(new THREE.Mesh(geometry, material));

  cube.on('ready'/*RODIN.CONSTANTS.EVENT_NAMES.READY*/, (evt) => {
    evt.target.object3D.position.set(Math.randomFloatIn(-0.75,0.75),
      scene.controls.userHeight - Math.randomFloatIn(-1.5,1.5),
      Math.randomFloatIn(-0.75,0.75));
    scene.add(evt.target.object3D);
    RODIN.Raycastables.push(evt.target.object3D);
  });

  cube.on('update'/*RODIN.CONSTANTS.EVENT_NAMES.UPDATE*/, (evt) => {
    evt.target.object3D.rotation.y += RODIN.Time.deltaTime() / 500;
  });
  cube.on(RODIN.CONSTANTS.EVENT_NAMES.CONTROLLER_HOVER, (evt) => {
    evt.target.object3D.scale.set(2, 2, 2);
  });
  cube.on(RODIN.CONSTANTS.EVENT_NAMES.CONTROLLER_HOVER_OUT, (evt) => {
    evt.target.object3D.scale.set(1, 1, 1);
  });
}
