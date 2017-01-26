import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL';
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager';
import {CubeObject} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/CubeObject';
import {MouseController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/MouseController';
import {ViveController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/ViveController';

import './objects/room.js';
import './objects/screen.js';
import './controllers.js';
// import './sky.js';

const scene = SceneManager.get();
const amLight = new THREE.AmbientLight();
amLight.intensity = 1.2;
scene.add(amLight);
git