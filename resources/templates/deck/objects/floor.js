import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL';
import {THREEObject} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/THREEObject';
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager';
import {Animation} from 'https://cdn.rodin.io/v0.0.1/rodinjs/animation/Animation';
import {EVENT_NAMES} from 'https://cdn.rodin.io/v0.0.1/rodinjs/constants/constants';
import {Time} from 'https://cdn.rodin.io/v0.0.1/rodinjs/time/Time'

const time = Time.getInstance();
const scene = SceneManager.get();

const breakDownAnimation = new Animation('break', {
    position: {
        y: -15
    }
});
breakDownAnimation.duration(2000);

export class Floor extends THREEObject {
    constructor() {
        super(new THREE.Object3D());

        this.cubeCount = 30;
        this.cubeWidht = 1;
        this.cubes = [];

        this.on('ready', () => {
            scene.add(this.object3D);
            this.setup();
        })
    }

    setup() {
        const plane = new THREE.PlaneGeometry(this.cubeWidht, this.cubeWidht, 2, 2);
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            depthWrite: false,
            opacity: 0.5,
            map: new THREE.TextureLoader().load("./models/plane/planeground.png")
        });

        const center = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < this.cubeCount; i++) {
            for (let j = 0; j < this.cubeCount; j++) {
                const position = new THREE.Vector3((i - this.cubeCount / 2) * this.cubeWidht, 0, (j - this.cubeCount / 2) * this.cubeWidht);
                const obj = new THREEObject(new THREE.Mesh(plane, material));

                obj.object3D.rotation.x = -Math.PI / 2;
                obj.object3D.position.copy(position);
                this.object3D.add(obj.object3D);
                obj.object3D.visible = false;
                obj.object3D.distanceFromCenter = position.distanceTo(center);
                obj.mustBrake = Math.random() < obj.object3D.distanceFromCenter / (this.cubeCount * this.cubeWidht / 2);
                if(obj.mustBrake) {
                    obj.animator.add(breakDownAnimation);
                    obj.on(EVENT_NAMES.ANIMATION_COMPLETE, (evt) => {
                        evt.target.object3D.visible = false;
                    });
                }
                this.cubes.push(obj);
            }
        }
    }

    animate() {
        for(let i = 0; i < this.cubes.length; i ++) {
            const obj = this.cubes[i];
            setTimeout(() => {
                obj.object3D.visible = true;
                if(obj.mustBrake) {
                    setTimeout(() => {
                        obj.speed = 0;
                        obj.on('update', (evt) => {
                            if(!evt.target.object3D.visible) return;
                            evt.target.object3D.position.y -= evt.target.speed * time.deltaTime() / 1000;
                            evt.target.speed += time.deltaTime() / 1000 * 9.8;

                            if(evt.target.object3D.position.y < -200) {
                                evt.target.object3D.visible = false;
                            }
                        });
                    }, 5000 * Math.random())
                }
            }, obj.object3D.distanceFromCenter * 200 + 500)
        }
    }
}

export const floor = new Floor();
