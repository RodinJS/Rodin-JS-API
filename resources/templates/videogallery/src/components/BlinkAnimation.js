import * as RODIN from 'rodin/core';


export class blinkAnimation extends RODIN.EventEmitter {
    constructor() {
        super();
        blinkAnimation.instance = this;

        this.eyelidContainer = new RODIN.Sculpt();
        this.topEyelid = new RODIN.Plane(1, 0.05, new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0x000000
        }));
        this.topEyelid.position.z = -0.02;
        this.topEyelid.position.y = 0.04;
        this.bottomEyelid = new RODIN.Plane(1, 0.05, new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0x000000
        }));
        this.eyelidContainer._threeObject.renderOrder = 10000;
        this.bottomEyelid.position.z = -0.02;
        this.bottomEyelid.position.y = -0.04;
        this.eyelidContainer.add(this.topEyelid);
        this.eyelidContainer.add(this.bottomEyelid);

        this.topEyelid.on(RODIN.CONST.ANIMATION_COMPLETE, (evt) => {
            if (evt.animation === 'close') {
                this.emit('Closed', new RODIN.RodinEvent());
            } else {
                this.emit('Opened', new RODIN.RodinEvent());
            }
        });

        this.topEyelid.animation.add(blinkAnimation._makeAnimation(0.04, 'open', 1000));
        this.bottomEyelid.animation.add(blinkAnimation._makeAnimation(-0.04, 'open', 1000));

        this.topEyelid.animation.add(blinkAnimation._makeAnimation(0.025, 'close', 1000));
        this.bottomEyelid.animation.add(blinkAnimation._makeAnimation(-0.025, 'close', 1000));

    }

    set camera(camera) {
        camera.add(this.eyelidContainer);
    }

    static _makeAnimation(pos, type, duration) {
        let animate = new RODIN.AnimationClip(type, {
            position: {
                y: pos,
            },
        });
        animate.duration(duration);
        return animate;
    }

    close() {
        this.topEyelid.animation.start('close');
        this.bottomEyelid.animation.start('close');

    }

    open() {
        this.topEyelid.animation.start('open');
        this.bottomEyelid.animation.start('open');
    }

    static instance = null;

    static get() {
        if (!blinkAnimation.instance) {
            new blinkAnimation();
        }
        return blinkAnimation.instance;
    }
}