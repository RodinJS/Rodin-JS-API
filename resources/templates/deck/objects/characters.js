//Created by xgharibyan


import {ModelLoader} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/ModelLoader';

function createMan(){
    const person = ModelLoader.load('./models/men/human_men.json');
    person.on('ready', (evt)=>{
        const materials = evt.target.object3D.children[0].material.materials;
        materials[0].map = (new THREE.TextureLoader()).load("./models/men/human_men.jpg");
        materials[1].map = (new THREE.TextureLoader()).load("./models/men/01.jpg");    
        evt.target.object3D.scale.set(0.01, 0.01, 0.01);
    });
    return person;
}

function createWoman(){
    const person = ModelLoader.load('./models/woman/human_women.json');
    person.on('ready', (evt)=>{
        const materials = evt.target.object3D.children[0].material.materials;
        materials[0].map = new THREE.TextureLoader().load("./models/woman/jillvalentineleg_d.jpg");
        materials[1].map = new THREE.TextureLoader().load("./models/woman/jillvalentinetorso_d.jpg");
        materials[2].map = new THREE.TextureLoader().load("./models/woman/jillvalentinehead_d.jpg");
        materials[3].map = new THREE.TextureLoader().load("./models/woman/jillvalentinehair_d.jpg");
        materials[4].map = new THREE.TextureLoader().load("./models/woman/01.jpg");
        //evt.target.object3D.position.z = - 2;
        evt.target.object3D.scale.set(0.01, 0.01, 0.01);
        //scene.add(evt.target.object3D);
    });
    return person;
}

function createMan2() {
    const person = ModelLoader.load('./models/men1/human_men_02.json');
    person.on('ready', (evt) => {
        const materials = evt.target.object3D.children[0].material.materials;
        materials[0].map = new THREE.TextureLoader().load("./models/men1/feet_diff_000_a_uni.jpg");
        materials[1].map = new THREE.TextureLoader().load("./models/men1/hand_diff_000_a_whi.jpg");
        materials[2].map = new THREE.TextureLoader().load("./models/men1/lowr_diff_000_o_uni.jpg");
        materials[3].map = new THREE.TextureLoader().load("./models/men1/teef_diff_000_a_uni.jpg");
        materials[4].map = new THREE.TextureLoader().load("./models/men1/lowr_diff_000_d_uni.jpg");
        materials[5].map = new THREE.TextureLoader().load("./models/men1/uppr_diff_000_m_uni.jpg");
        materials[6].map = new THREE.TextureLoader().load("./models/men1/head_diff_000_c_whi.jpg");
        materials[7].map = new THREE.TextureLoader().load("./models/men1/01.jpg");
        //evt.target.object3D.position.z = - 2;
        //evt.target.object3D.position.x = - 1;
        evt.target.object3D.scale.set(0.01, 0.01, 0.01);
        //scene.add(evt.target.object3D);
    });
}

function dotAngle(a, b) {
   return Math.acos((a.x * b.x + a.y * b.y) / a.length() / b.length());
}
function getAngle(a, b) {
   a = a.sub(b);
   if (a.x >= 0 && a.y >= 0) {
       return dotAngle(a, new THREE.Vector2(1, 0));
   } else if (a.x >= 0 && a.y < 0) {
       return Math.PI * 2.0 - dotAngle(a, new THREE.Vector2(1, 0));
   } else if (a.x < 0 && a.y < 0) {
       return Math.PI * 2.0 - dotAngle(a, new THREE.Vector2(1, 0));
   } else {
       return dotAngle(a, new THREE.Vector2(1, 0));
   }
}

export {createMan2, createMan, createWoman, getAngle}
