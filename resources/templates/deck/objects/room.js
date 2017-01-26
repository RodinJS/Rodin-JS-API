import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL';
import {ModelLoader} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/ModelLoader';
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager';

const scene = SceneManager.get();

export const room = ModelLoader.load('./models/room/room.json');

room.on('ready', (evt) => {
    const floorTexture = new THREE.TextureLoader().load("./models/room/floor.jpg");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);

    evt.target.object3D.children[0].material.materials[0].map = floorTexture;
    evt.target.object3D.scale.set(.004, .004, .004);
    scene.add(evt.target.object3D);
});
