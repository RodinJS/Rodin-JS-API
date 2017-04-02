import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL';
import {THREEObject} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/THREEObject';
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager';


const scene = SceneManager.get();
const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide
});

const textureLoader = new THREE.TextureLoader();
material.map = textureLoader.load('./images/background.jpg');
export const space = new THREEObject(new THREE.Mesh(new THREE.SphereGeometry(90, 40, 40), material));

space.show = function () {
    if(space.ready) {
       return scene.add(space.object3D);
    }

    space.on('ready', () => {
        scene.add(space.object3D)
    })
};
