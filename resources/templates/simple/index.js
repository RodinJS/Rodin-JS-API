import * as RODIN from 'rodin/core';
RODIN.start();

const randomFloatIn = (min, max) => Math.random() * (max - min) + min;
let mouseController = new RODIN.MouseController();

for (let i = 0; i < 1000; i++) {
 let cube = new RODIN.Sculpt(new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.015), new THREE.MeshNormalMaterial()));

 cube.on(RODIN.CONST.READY, (evt) => {
   evt.target.raycastable = true;
   evt.target.position.set(randomFloatIn(-0.75,0.75),1.6 - randomFloatIn(-1.5,1.5), randomFloatIn(-0.75,0.75));
   RODIN.Scene.add(evt.target);
 });

 cube.on(RODIN.CONST.UPDATE, (evt) => {
   evt.target.rotation.y += RODIN.Time.delta / 500;
 });

 cube.on(RODIN.CONST.CONTROLLER_HOVER, (evt) => {
   evt.target.scale.set(2, 2, 2);
 });

 cube.on(RODIN.CONST.CONTROLLER_HOVER_OUT, (evt) => {
   evt.target.scale.set(1, 1, 1);
 });
}