import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL';
import 'https://cdn.rodin.io/v0.0.1/vendor/three/examples/js/loaders/OBJLoader';
import * as RODIN from 'https://cdn.rodin.io/v0.0.1/rodinjs/RODIN';
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager';
import {ViveController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/ViveController';
import {OculusController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/OculusController';
import {MouseController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/MouseController';
import {CardboardController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/CardboardController';

let scene = SceneManager.get();
let controls = scene.controls;

function setupGazePointUpdate(gazePoint) {
    gazePoint.Sculpt.object3D.renderOrder = 10000;

    gazePoint.Sculpt.on('update', () => {
        gazePoint.alpha = gazePoint.controller.intersected.length === 0 ? .00000001 : .02;
        if (gazePoint.controller.intersected.length !== 0) {
            gazePoint.fixedDistance = 0;
        }
        gazePoint.currentAlpha = gazePoint.currentAlpha || gazePoint.alpha;
        let delta = (gazePoint.alpha - gazePoint.currentAlpha) * RODIN.Time.deltaTime() * 0.01;
        if (Math.abs(delta) < 0.0000001) return;
        gazePoint.currentAlpha += delta;

        gazePoint.Sculpt.object3D.geometry.dispose();
        gazePoint.Sculpt.object3D.geometry = new THREE.RingGeometry(.00000001 + gazePoint.currentAlpha, .01 + gazePoint.currentAlpha, 32);
    });
}

/**
 * Mouse Controller
 */
export const mouse = new MouseController();
mouse.raycastLayers = 2;
SceneManager.addController(mouse);


/**
 * Cardboard Controller
 */
export let cardboard = null;
cardboard = new CardboardController();
cardboard.raycastLayers = 2;
SceneManager.addController(cardboard);
setTimeout(() => {
    setupGazePointUpdate(cardboard.gazePoint);
}, 2000);

/**
 * Oculus Controller
 */
export let oculus = null;
oculus = new OculusController();
oculus.raycastLayers = 2;
SceneManager.addController(oculus);
setTimeout(() => {
    setupGazePointUpdate(oculus.gazePoint);
}, 2000);

/**
 * Vive Controllers
 */
let controllerL = new ViveController(RODIN.CONSTANTS.CONTROLLER_HANDS.LEFT, scene, scene.camera, 2);
let controllerR = new ViveController(RODIN.CONSTANTS.CONTROLLER_HANDS.RIGHT, scene, scene.camera, 2);
controllerL.standingMatrix = controls.getStandingMatrix();
controllerL.initControllerModel();
controllerL.initRaycastingLine();
SceneManager.addController(controllerL);
scene.add(controllerL);

controllerR.standingMatrix = controls.getStandingMatrix();
controllerR.initControllerModel();
controllerR.initRaycastingLine();
SceneManager.addController(controllerR);
scene.add(controllerR);

export const vive = {
    left: controllerL,
    right: controllerR
};
