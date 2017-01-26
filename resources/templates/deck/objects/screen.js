import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL';
import {Element} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/elements/Element';
import {THREEObject} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/THREEObject';
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager';
import {Animation} from 'https://cdn.rodin.io/v0.0.1/rodinjs/animation/Animation';
import {EVENT_NAMES} from 'https://cdn.rodin.io/v0.0.1/rodinjs/constants/constants';

const scene = SceneManager.get();

const hoverAnimation = new Animation('hover', {
    scale: {
        x: 1.01,
        y: 1.01,
        z: 1.01
    }
});
hoverAnimation.duration(100);

const hoverOutAnimation = new Animation('hoverout', {
    scale: {
        x: 1,
        y: 1,
        z: 1
    }
});
hoverOutAnimation.duration(100);

export class Screen extends THREEObject {
    constructor() {
        const width = 6;
        const p = 1920 / 1080;
        const height = width / p;

        super(new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1, 1), new THREE.MeshBasicMaterial({side: THREE.DoubleSide})));

        this.animator.add(hoverAnimation, hoverOutAnimation);

        const textureLoader = new THREE.TextureLoader();

        this.slides = [
            textureLoader.load('./images/presentation/p2.jpg'),
            textureLoader.load('./images/presentation/p3.jpg'),
            textureLoader.load('./images/presentation/p4.jpg')
        ];

        this.on('ready', () => {
            this.currentIndex = 0;
            this.show(0);

            this.backButton = new Element({
                width: .15,
                height: .15,
                background: {
                    color: 0xaaaaaa,
                    opacity: 0
                },
                image: {
                    url: "./images/backbutton.png",
                    width: .15,
                    height: .15,
                    opacity: 1,
                    position: {
                        h: 50,
                        v: 50
                    }
                }
            });

            this.backButton.on('ready', (evt) => {
                evt.target.object3D.position.set(-width / 2 + .4, height / 2 - .3, .1);
                this.object3D.add(evt.target.object3D);
                evt.target.raycastable = true;
                evt.target.animator.add(hoverAnimation, hoverOutAnimation);
            });

            this.backButton.on(EVENT_NAMES.CONTROLLER_HOVER, (evt) => {
                if (evt.target.animator.isPlaying('hoverout')) {
                    evt.target.animator.stop('hoverout', false);
                }
                evt.target.animator.start('hover');
            });

            this.backButton.on(EVENT_NAMES.CONTROLLER_HOVER_OUT, (evt) => {
                if (evt.target.animator.isPlaying('hover')) {
                    evt.target.animator.stop('hover', false);
                }
                evt.target.animator.start('hoverout');
            });

            this.backButton.on([EVENT_NAMES.CONTROLLER_KEY_DOWN, EVENT_NAMES.CONTROLLER_KEY_UP], (evt) => {
                evt.stopPropagation();
            });

            this.backButton.on(EVENT_NAMES.CONTROLLER_KEY_UP, () => {
                this.prev();
            });
        });
    }

    show(slideIndex) {
        this.object3D.material.map = this.slides[slideIndex];
        this.currentIndex = slideIndex;
    }

    next() {
        if (this.currentIndex < this.slides.length - 1) {
            this.show(this.currentIndex + 1);
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.show(this.currentIndex - 1);
        }
    }
}

export const screen = new Screen();

screen.on('ready', (evt) => {
    evt.target.object3D.position.y = 1.9;
    evt.target.object3D.position.z = -4;
    evt.target.raycastable = true;
    scene.add(evt.target.object3D);
});

screen.on(EVENT_NAMES.CONTROLLER_HOVER, (evt) => {
    if (evt.target.animator.isPlaying('hoverout')) {
        evt.target.animator.stop('hoverout', false);
    }
    evt.target.animator.start('hover');
});

screen.on(EVENT_NAMES.CONTROLLER_HOVER_OUT, (evt) => {
    if (evt.target.animator.isPlaying('hover')) {
        evt.target.animator.stop('hover', false);
    }
    evt.target.animator.start('hoverout');
});

screen.on(EVENT_NAMES.CONTROLLER_KEY_UP, (evt) => {
    evt.target.next();
});
