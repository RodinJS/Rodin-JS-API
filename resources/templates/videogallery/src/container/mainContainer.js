import * as RODIN from 'rodin/core';
import {blinkAnimation} from '../components/BlinkAnimation.js';
import { VideoContainer } from './videoContainer.js';
import { Navigation} from '../components/Navigation.js';
export class MainContainer {
    constructor() {
        this.enviroment = new RODIN.Sphere(90, 720, 4, new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: RODIN.Loader.loadTexture('./src/assets/space.jpg')
        }));
        this.loader = new RODIN.Plane(8, 4.5, new THREE.MeshBasicMaterial({transparent: true, map: RODIN.Loader.loadTexture('./src/assets/Rodin_video_gallery.png')}));
        this.loader.on(RODIN.CONST.READY, env => {
            this.enviroment.add(env.target);
            env.target.position.z = - 10
        });
        this.enviroment.needsUpdate = true;
        this.transition = blinkAnimation.get();
        this.containers = [];
    }

    get object() {
        return this.enviroment;
    }

    run() {
        RODIN.Scene.add(this.enviroment);
        // this.changeEnviroment();
        RODIN.Scene.HMDCamera.name = 'mainCamera';
        this.transition.camera = RODIN.Scene.HMDCamera;

        setTimeout(() => {
            this.transition.close()
        }, 5000);

        const onclose = (evt)=>{
            this.transition.removeEventListener('Closed', onclose);
            this.changeEnviroment();
            this.transition.open();
        };

        this.transition.on('Closed', onclose);
    }

    changeEnviroment() {
        this.loader._threeObject.material.visible = false;
        this.enviroment._threeObject.material.map = RODIN.Loader.loadTexture('./src/assets/env.jpg');
        let videoContainer = new VideoContainer(this.transition);
        this.containers.push(new Navigation(videoContainer));
    }
}
