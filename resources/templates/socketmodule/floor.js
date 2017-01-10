import * as RODIN from 'https://cdn.rodin.io/v0.0.4/rodinjs/RODIN.js';
import {THREE} from 'https://cdn.rodin.io/v0.0.4/vendor/three/THREE.GLOBAL.js';

export default function (scene) {
    let cube = new RODIN.THREEObject(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()))
}
