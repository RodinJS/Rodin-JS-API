import * as RODIN from 'rodin/core';
import { VPcontrolPanel } from '../components/vpControls.js';
RODIN.start();

export const videoPlayerScene = new RODIN.Scene('videoPlayerScene');
window.camera = videoPlayerScene.activeCamera;

export class VideoPlayer {
    constructor() {
        this.player = new RODIN.MaterialPlayer({
            HD: '',
            SD: '',
            default: 'HD'
        });
    }


    playVideo(url, title, backgroundImage, transition) {
        if (this.controls) {
            this.controls.destroy();
            this.controls.parent.remove(this.controls)
        }
        this.controls = new VPcontrolPanel({
            player: this.player,
            title: title,
            cover: backgroundImage,
            distance: 2,
            width: 3
        },transition);
        this.container();

        this.player.loadVideo(url)

    }


    container() {
        let controlPanel, material, sphere;

        videoPlayerScene.preRender(() => {
            this.player.update(RODIN.Time.delta);
        });
        controlPanel = this.controls;
        controlPanel.on(RODIN.CONST.READY, (evt) => {
            videoPlayerScene.add(evt.target);
            evt.target.position.y = 1.6;
            if (evt.target.coverEl) {
                evt.target.coverEl.rotation.y = -Math.PI / 2;
            }
        });
        material = new THREE.MeshBasicMaterial({
            map: this.player.getTexture()
        });
        sphere = new RODIN.Sculpt(new THREE.Mesh(new THREE.SphereBufferGeometry(90, 720, 4), material));
        sphere.scale.set(1, 1, -1);
        sphere.rotation.y = Math.PI / 2;
        videoPlayerScene.add(sphere);
    }

}