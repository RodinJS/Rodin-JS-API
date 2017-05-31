import * as RODIN from 'rodin/core';

let bufferAnimation = new RODIN.AnimationClip("bufferAnimation", {
    rotation: {
        x: 0,
        y: {
            from: -Math.PI / 2,
            to: Math.PI / 2,
        },
        z: 0
    }
});
bufferAnimation.loop(true);
bufferAnimation.duration(1000);

let hoverAnimation = new RODIN.AnimationClip("hoverAnimation", {
    scale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
    }
});
hoverAnimation.duration(200);

let hoverOutAnimation = new RODIN.AnimationClip("hoverOutAnimation", {
    scale: {
        x: 1,
        y: 1,
        z: 1
    }
});
hoverOutAnimation.duration(200);

let scaleOutAnimation = new RODIN.AnimationClip("scaleOutAnimation", {
    scale: {
        x: 0.01,
        y: 0.01,
        z: 0.01
    }
});
scaleOutAnimation.duration(150);

let scaleInAnimation = new RODIN.AnimationClip("scaleInAnimation", {
    scale: {
        x: 1,
        y: 1,
        z: 1
    }
});
scaleInAnimation.duration(150);


const secondsToH_MM_SS = (length, separator = ":") => {
    length = Math.round(length);
    let hours = Math.floor(length / 3600);
    length %= 3600;
    let minutes = Math.floor(length / 60);
    if (minutes < 10 && hours != 0) {
        minutes = "0" + minutes;
    }
    let seconds = length % 60;

    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return ((hours !== 0 ? hours + separator : "") + minutes + separator + seconds);
};

export class VPcontrolPanel extends RODIN.Sculpt {

    constructor({player, title = "Untitled Video", cover = null, distance = 1.5, width = 1.5}, transition) {

        super(new THREE.Object3D());
        this.transition = transition;
        this.scene = RODIN.Scene.getByName("videoPlayerScene");
        this.panel = new RODIN.Sculpt();
        this.player = player;
        this.cover = cover;
        this.width = width;
        this.elementsPending = 0;
        this.timeBarButton = null;
        this.coverEl = null;
        this.title = title;

        this.panelCenter = new RODIN.Sculpt();

        this.panel.parent = this.panelCenter;
        this.panel.position.set(0, 0, -distance);
        this.panelCenter.parent = this;
        this.panelCenter.position.set(0, 0, 0);

        this.createTitle();
        this.createBackButton();
        this.createPlayPauseButtons();
        this.createTimeLine();
        this.createTimeBar();
        this.createAudioToggle();
        this.createHDToggle();
        this.createBackGround(distance, width);
        this.createBufferingLogo(distance);
        this.cover && this.createCover(distance, width);
        this.hoverOutTime = Infinity;
        this.hasCloseAction = false;


        this.hoverAction = (evt) => {
            this.hoverOutTime = Infinity;
        };
        this.hoverOutAction = (evt) => {
            this.hoverOutTime = RODIN.Time.now;
        };

        this.player.onBufferStart = () => {
            this.bufferEl.visible = true;
            console.log("buffering START");
        };

        this.player.onBufferEnd = () => {
            this.bufferEl.visible = false;
            console.log("buffering STOP");
        };

        this.onButtonDown = () => {
            this.buttonDownTime = RODIN.Time.now;
        };
        this.scene.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, this.onButtonDown);


        this.onButtonUp = () => {
            if (this.buttonDownTime && RODIN.Time.now - this.buttonDownTime >= 250) return;
            this.toggleControls();
        };
        this.scene.on(RODIN.CONST.GAMEPAD_BUTTON_UP, this.onButtonUp);


        this.onUpdate = () => {
            if (RODIN.Time.now - this.hoverOutTime > 3000 && !this.hasCloseAction) {
                this.hideControls();
                this.hasCloseAction = true;
            }
        };
        this.scene.on(RODIN.CONST.UPDATE, this.onUpdate);

    }

    hideControls() {
        this.panel.parent = null;
    }

    showControls() {
        this.panel.parent = this.panelCenter;
        let vector = this.scene.avatar.HMDCamera._threeObject.getWorldDirection();
        let newRot = Math.atan(vector.x / vector.z) + (vector.z < 0 ? Math.PI : 0) + Math.PI;
        if (Math.abs(this.rotation.y - newRot) >= Math.PI / 3) {
            this.panelCenter.rotation.y = newRot;
        }
        this.hasCloseAction = false;
        this.hoverOutTime = RODIN.Time.now;
    }

    toggleControls() {
        if (this.panel.parent === this.panelCenter) {
            this.hideControls();
        } else {
            this.showControls();
        }
    }

    readyCheck() {
        if (!this.elementsPending) {
            this.emitAsync(RODIN.CONST.READY, new RODIN.RodinEvent(this));
        }
    }

    createBackGround(distance, width) {
        let r = Math.sqrt(distance * distance + width * width / 4) * 2;

        let sphere = new RODIN.Sculpt(new THREE.Mesh(
            new THREE.SphereBufferGeometry(r, 12, 12),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.3,
                //wireframe:true,
                side: THREE.BackSide
            })
        ));

        sphere._threeObject.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -r));
        sphere.parent = this.panel;
        sphere.position.set(0, 0, r);
    }


    createCover(distance, width) {
        let r = Math.sqrt(distance * distance + width * width / 4) * 3;

        let coverMesh = new THREE.Mesh(
            new THREE.SphereBufferGeometry(r, 720, 4),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: new THREE.TextureLoader().load(this.cover),
                side: THREE.DoubleSide
            })
        );

        coverMesh.scale.set(-1, 1, 1);

        this.coverEl = new RODIN.Sculpt(coverMesh);
        this.coverEl.on(RODIN.CONST.READY, (evt) => {
            this.coverEl.parent = this;
        });
    }

    createBackButton() {
        let backParams = {name: "back", width: this.width / 8, height: this.width / 8, ppm: 500};

        backParams.background = {
            image: {
                url: "./src/assets/icons/backButton.png"
            },
            opacity: 0.5
        };
        this.elementsPending++;

        let back = new RODIN.Element(backParams);
        back.on(RODIN.CONST.READY, (evt) => {
            evt.target.parent = this.panel;
            evt.target.position.set(-this.width / 2.2, this.width / 4, 0);
            evt.target.animation.add(hoverAnimation, hoverOutAnimation);
            this.elementsPending--;
            this.readyCheck();
        });
        back.on(RODIN.CONST.GAMEPAD_HOVER, (evt) => {
            evt.target.animation.start("hoverAnimation");
        });
        back.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (evt) => {
            evt.target.animation.start("hoverOutAnimation");
        });
        back.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            this.pauseButton.scale.set(1, 1, 1);
            this.playButton.scale.set(1, 1, 1);
            this.pauseButton.parent = null;
            this.playButton.parent = this.panel;
            this.player.pause();
            this.player.jumpTo(0);
            this.transition.close();

            const onclose = (evt) => {
                this.transition.removeEventListener('Closed', onclose);

                RODIN.Scene.go('Main');
                RODIN.Scene.HMDCamera.name = 'mainCamera';
                this.transition.camera = RODIN.Scene.HMDCamera;

                // we need this timeout because of a bug in lib
                // remove this when lib is fixed
                setTimeout(() => {
                    this.transition.open();
                }, 0);
            };

            this.transition.on('Closed', onclose);
            // var check = false;
            // (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|ki
            // ndle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
            //
            // if (check && RODIN.Scene.webVRmanager.mode === 3)
            //     RODIN.GamePad.cardboard.enable();
        });
    }

    createTitle() {
        let titleParams = {
            text: this.title,
            color: 0xffffff,
            fontFamily: "Arial",
            fontSize: this.width * 0.04,
            ppm: 1000
        };
        let titleButton = new RODIN.Text(titleParams);
        this.elementsPending++;

        titleButton.on(RODIN.CONST.READY, (evt) => {
            titleButton.parent = this.panel;
            titleButton.position.set(0, this.width / 4, 0);
            this.elementsPending--;
            this.readyCheck();
        });
    }

    createPlayPauseButtons() {
        let playParams = {name: "play", width: this.width / 5, height: this.width / 5};

        playParams.background = {
            color: 0x666666,
            opacity: 0.3
        };

        playParams.border = {
            radius: this.width / 10
        };

        playParams.image = {
            url: "./src/assets/icons/play.png",
            width: this.width / 15,
            height: this.width / 15,
            position: {h: 54, v: 50}
        };

        let playButton = new RODIN.Element(playParams);
        this.playButton = playButton;
        this.elementsPending++;

        playButton.on(RODIN.CONST.READY, (evt) => {
            playButton.parent = this.panel;
            playButton.position.set(0, 0, 0);
            playButton.animation.add(hoverAnimation, hoverOutAnimation, scaleOutAnimation, scaleInAnimation);
            this.elementsPending--;
            this.readyCheck();
        });

        playButton.on(RODIN.CONST.GAMEPAD_HOVER, (evt) => {
            this.hoverAction(evt);
            !evt.target.animation.isPlaying() && evt.target.animation.start("hoverAnimation");
        });

        playButton.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (evt) => {
            this.hoverOutAction(evt);
            !evt.target.animation.isPlaying() && evt.target.animation.start("hoverOutAnimation");
        });

        playButton.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            evt.stopPropagation();
            if (this.visible) {
                evt.target.animation.start("scaleOutAnimation");
            }
        });

        playButton.on(RODIN.CONST.ANIMATION_COMPLETE, (evt) => {
            if (evt.animation === "scaleOutAnimation") {
                playButton.parent = null;
                pauseButton.parent = this.panel;
                pauseButton.animation.start("scaleInAnimation");
                if (this.cover && this.coverEl) {
                    this.coverEl.visible = false;
                }
                this.player.play();
            }
        });


        let pauseParams = {name: "pause", width: this.width / 5, height: this.width / 5};

        pauseParams.background = {
            color: 0x666666,
            opacity: 0.3
        };

        pauseParams.border = {
            radius: this.width / 10
        };

        pauseParams.image = {
            url: "./src/assets/icons/pause.png",
            width: this.width * 0.04,
            height: this.width * 0.06,
            position: {h: 50, v: 50}
        };

        let pauseButton = new RODIN.Element(pauseParams);
        this.pauseButton = pauseButton;
        this.elementsPending++;

        pauseButton.on(RODIN.CONST.READY, (evt) => {
            pauseButton.parent = this.panel;
            pauseButton.position.set(0, 0, 0);
            pauseButton.parent = null;
            evt.target.animation.add(hoverAnimation, hoverOutAnimation, scaleOutAnimation, scaleInAnimation);
            this.elementsPending--;
            this.readyCheck();
        });

        pauseButton.on(RODIN.CONST.GAMEPAD_HOVER, (evt) => {
            this.hoverAction(evt);
            !evt.target.animation.isPlaying() && evt.target.animation.start("hoverAnimation");
        });

        pauseButton.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (evt) => {
            this.hoverOutAction(evt);
            !evt.target.animation.isPlaying() && evt.target.animation.start("hoverOutAnimation");
        });

        pauseButton.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            evt.stopPropagation();
            if (this.visible) {
                evt.target.animation.start("scaleOutAnimation");
            }
        });

        pauseButton.on(RODIN.CONST.ANIMATION_COMPLETE, (evt) => {
            if (evt.animation === "scaleOutAnimation") {
                pauseButton.parent = null;
                playButton.parent = this.panel;
                playButton.animation.start("scaleInAnimation");
                this.player.pause();
            }

            if (evt.animation === 'scaleInAnimation') {
                console.log(pauseButton.scale.valueOf());
            }
        });
    }


    createBufferingLogo(distance) {
        const bufferingParams = {name: "buffering", width: this.width / 6, height: this.width / 6};

        bufferingParams.background = {
            color: 0x666666,
            opacity: 0.3
        };

        bufferingParams.border = {
            radius: this.width / 12,
            width: this.width / 500,
            color: 0xffffff
        };

        bufferingParams.image = {
            url: "./src/assets/icons/rodin.png",
            width: this.width / 30,
            height: this.width / 25,
            position: {h: 54, v: 35}
        };
        bufferingParams.label = {
            text: "loading",
            fontSize: this.width / 37.5,
            color: 0xffffff,
            position: {
                h: 50,
                v: 65
            }
        };

        this.bufferEl = new RODIN.Element(bufferingParams);
        this.elementsPending++;

        this.bufferEl.on(RODIN.CONST.READY, (evt) => {
            this.panel.add(this.bufferEl);
            this.bufferEl.position.set(0, 0, -distance + bufferingParams.width / 2);
            this.bufferEl.visible = false;
            this.bufferEl.animation.add(bufferAnimation);
            this.bufferEl.animation.start("bufferAnimation");
            this.elementsPending--;
            this.readyCheck();
        });
    }


    createTimeLine() {
        const color = 0xff9a2b;

        const timeLineBGParams = {
            name: "timeLineBG",
            width: this.width,
            height: this.width / 50,
            background: {
                color: 0xaaaaaa,
                opacity: 0.5
            }
        };

        const timeLineParams = {
            name: "timeLine",
            width: this.width,
            height: this.width / 50,
            background: {
                color: color
            },
            transparent: false
        };

        const caretParams = {
            name: "caret",
            width: this.width * 0.024,
            height: this.width * 0.024,
            border: {
                radius: this.width * 0.012
            },
            background: {
                color: 0xffffff
            },
            transparent: false
        };

        const pointerParams = {
            name: "pointer",
            width: this.width * 0.046,
            height: this.width * 0.046,
            border: {
                width: this.width / 500,
                color: 0xffffff,
                radius: this.width * 0.023
            },
            label: {
                text: "I",
                fontSize: this.width / 37.5,
                color: 0xff0000,
                position: {
                    h: 50,
                    v: 55
                }
            }
        };

        const pointerTimeParams = {
            name: "pointerTimeParams",
            text: "0:00",
            color: 0xffffff,
            fontFamily: "Arial",
            fontSize: this.width / 37.5,
            ppm: 1000
        };

        let timeLineBG = new RODIN.Element(timeLineBGParams);
        this.elementsPending++;


        timeLineBG.on(RODIN.CONST.READY, (evt) => {
            timeLineBG.parent = this.panel;
            timeLineBG.position.set(0, -this.width / 3.75, 0);
            this.elementsPending--;
            this.readyCheck();
        });


        timeLineBG.on(RODIN.CONST.GAMEPAD_MOVE, (evt) => {
            this.hoverAction(evt);
            if (pointer.isReady) {
                pointer.visible = true;
                pointer.position.x = evt.uv.x - this.width / 2;
            }

            if (pointerTime.isReady) {
                let time = secondsToH_MM_SS(this.player.getLength() * evt.uv.x / this.width);
                pointerTime.position.x = evt.uv.x - this.width / 2;
                if (time === pointerTime.lastTime && pointerTime.visible) return;
                pointerTimeParams.text = time;
                pointerTime.reDraw(pointerTimeParams);
                pointerTime.visible = true;
                pointerTime.lastTime = time;
            }
        });

        timeLineBG.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (evt) => {
            this.hoverOutAction(evt);
            if (pointer.isReady) {
                pointer.visible = false;
            }
            if (pointerTime.isReady) {
                pointerTime.visible = false;
            }
        });

        timeLineBG.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            evt.stopPropagation();
            this.player.jumpTo(evt.uv.x / this.width);
        });

        let timeLine = new RODIN.Element(timeLineParams);
        this.elementsPending++;

        timeLine.on(RODIN.CONST.READY, () => {
            timeLine.parent = this.panel;
            timeLine.position.set(0, -this.width / 3.75, 0.0001);
            timeLine.scale.set(0.0001, 1, 1);
            this.elementsPending--;
            this.readyCheck();
        });

        this.timeLine = timeLine;
        timeLine.on(RODIN.CONST.UPDATE, (evt) => {
            let time = this.player.getTime();
            time = time ? time : 0.0001;
            let duration = this.player.getLength();
            if (!duration) return;
            let scale = time / duration;
            timeLine.scale.set(scale, 1, 1);
            timeLine.position.x = (scale - 1) * this.width / 2;
        });


        let caret = new RODIN.Element(caretParams);
        this.elementsPending++;

        caret.on(RODIN.CONST.READY, (evt) => {
            caret.parent = this.panel;
            caret.position.y = -this.width / 3.75;
            caret.position.z = 0.0002;
            caret.position.x = -this.width / 2;
            this.elementsPending--;
            this.readyCheck();
        });

        caret.on('update', (evt) => {
            if (timeLine.isReady) {
                caret.position.x = timeLine.scale.x * this.width - this.width / 2;
            }
        });


        let pointer = new RODIN.Element(pointerParams);
        this.elementsPending++;

        pointer.on(RODIN.CONST.READY, (evt) => {
            pointer.parent = this.panel;
            pointer.position.y = -this.width / 3.75;
            pointer.position.z = 0.0004;
            pointer._threeObject.material.depthWrite = false;
            pointer.position.x = -this.width / 2;
            pointer.visible = false;
            this.elementsPending--;
            this.readyCheck();
        });

        let pointerTime = new RODIN.Text(pointerTimeParams);
        this.elementsPending++;

        pointerTime.on(RODIN.CONST.READY, (evt) => {
            pointerTime.parent = this.panel;
            pointerTime.position.y = -this.width * 0.21;
            pointerTime.position.z = 0.0004;
            pointerTime.position.x = 0;
            pointerTime.visible = false;
            this.elementsPending--;
            this.readyCheck();
        });

        this.caret = caret;
        this.pointer = pointer;
        this.pointerTime = pointerTime;
    }

    createTimeBar() {
        let timeBarParams = {
            text: "0:00/0:00",
            color: 0xffffff,
            fontFamily: "Arial",
            fontSize: this.width / 30,
            ppm: 1000
        };
        this.timeBarButton = new RODIN.Text(timeBarParams);
        this.elementsPending++;
        this.timeBarButton.on(RODIN.CONST.READY, (evt) => {
            this.timeBarButton.parent = this.panel;
            this.timeBarButton.position.set(-this.width / 2, -this.width / 3, 0);
            this.elementsPending--;
            this.readyCheck();
        });

        this.timeBarButton.on('update', (evt) => {
            let time = secondsToH_MM_SS(this.player.getTime());
            let total = secondsToH_MM_SS(this.player.getLength());
            if (time === evt.target.lastTime) return;
            timeBarParams.text = time + "/" + total;
            evt.target.reDraw(timeBarParams);

            if (!isNaN(this.player.getLength())) {
                evt.target.lastTime = time;
            }

            evt.target._threeObject.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(evt.target._threeObject.geometry.parameters.width / 2, 0, 0));
        });
    }


    createAudioToggle() {
        let muteParams = {name: "mute", width: this.width * 0.04, height: this.width * 0.04, ppm: 1000};

        muteParams.image = {
            url: "./src/assets/icons/audioON.png",
            width: this.width * 0.04,
            height: this.width * 0.04,
            position: {h: 50, v: 50}
        };

        let muteButton = new RODIN.Element(muteParams);
        this.elementsPending++;

        muteButton.on(RODIN.CONST.READY, (evt) => {
            muteButton.parent = this.panel;
            muteButton.position.set(-this.width / 2, -this.width / 3.02, 0);
            evt.target.animation.add(hoverAnimation, hoverOutAnimation);
            this.elementsPending--;
            this.readyCheck();
        });

        muteButton.on('update', (evt) => {
            if (this.timeBarButton) {
                muteButton.position.x = this.timeBarButton.position.x + this.timeBarButton.scale.x * this.timeBarButton._threeObject.geometry.parameters.width + this.width / 30;
            }
        });

        muteButton.on(RODIN.CONST.GAMEPAD_HOVER, (evt) => {
            this.hoverAction(evt);
            evt.target.animation.start("hoverAnimation");
        });

        muteButton.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (evt) => {
            this.hoverOutAction(evt);
            evt.target.animation.start("hoverOutAnimation");
        });

        muteButton.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            evt.stopPropagation();
            this.player.mute(true);
            muteButton.parent = null;
            unmuteButton.parent = this.panel;
            unmuteButton.position.set(-this.width / 2, -this.width / 3.02, 0);
        });

        let unmuteParams = {name: "unmute", width: this.width * 0.04, height: this.width * 0.04, ppm: 1000};

        unmuteParams.image = {
            url: "./src/assets/icons/audioOFF.png",
            width: this.width * 0.04,
            height: this.width * 0.04,
            opacity: 0.6,
            position: {h: 50, v: 50}
        };

        let unmuteButton = new RODIN.Element(unmuteParams);
        this.elementsPending++;

        unmuteButton.on(RODIN.CONST.READY, (evt) => {
            unmuteButton.parent = this.panel;
            unmuteButton.position.set(-this.width / 2, -this.width / 3.02, 0);
            evt.target.animation.add(hoverAnimation, hoverOutAnimation);
            this.elementsPending--;
            this.readyCheck();
            unmuteButton.parent = null;
        });

        unmuteButton.on('update', (evt) => {
            if (this.timeBarButton) {
                unmuteButton.position.x = this.timeBarButton.position.x + this.timeBarButton.scale.x * this.timeBarButton._threeObject.geometry.parameters.width + this.width / 30;
            }
        });

        unmuteButton.on(RODIN.CONST.GAMEPAD_HOVER, (evt) => {
            this.hoverAction(evt);
            evt.target.animation.start("hoverAnimation");
        });

        unmuteButton.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (evt) => {
            this.hoverOutAction(evt);
            evt.target.animation.start("hoverOutAnimation");
        });

        unmuteButton.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            evt.stopPropagation();
            this.player.mute(false);
            unmuteButton.parent = null;
            muteButton.parent = this.panel;
            muteButton.position.set(-this.width / 2, -this.width / 3.02, 0);
        });

    }

    createHDToggle() {
        let HDParams = {
            text: "HD",
            color: 0xffffff,
            fontFamily: "Arial",
            fontSize: this.width / 30,
            ppm: 1000
        };
        let HDButton = new RODIN.Text(HDParams);

        this.elementsPending++;

        HDButton.on(RODIN.CONST.READY, (evt) => {
            HDButton.parent = this.panel;
            HDButton.position.set(this.width * 0.48, -this.width / 3.02, 0);
            evt.target.animation.add(hoverAnimation, hoverOutAnimation);
            this.elementsPending--;
            this.readyCheck();
        });

        HDButton.on(RODIN.CONST.GAMEPAD_HOVER, (evt) => {
            this.hoverAction(evt);
            evt.target.animation.start("hoverAnimation");
        });

        HDButton.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (evt) => {
            this.hoverOutAction(evt);
            evt.target.animation.start("hoverOutAnimation");
        });

        HDButton.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            evt.stopPropagation();

            let playAfter = this.player.isPlaying();
            this.player.switchTo("SD");

            HDButton.parent = null;
            SDButton.parent = this.panel;
            SDButton.position.set(this.width * 0.48, -this.width / 3.02, 0);

            if (playAfter) {
                this.player.play();
            }
        });


        let SDParams = {
            text: "SD",
            color: 0xffffff,
            fontFamily: "Arial",
            fontSize: this.width / 30,
            ppm: 1000
        };
        let SDButton = new RODIN.Text(SDParams);

        this.elementsPending++;

        SDButton.on(RODIN.CONST.READY, (evt) => {
            SDButton.parent = this.panel;
            SDButton.position.set(this.width * 0.48, -this.width / 3.02, 0);
            evt.target.animation.add(hoverAnimation, hoverOutAnimation);
            this.elementsPending--;
            this.readyCheck();
            SDButton.parent = null;
        });

        SDButton.on(RODIN.CONST.GAMEPAD_HOVER, (evt) => {
            this.hoverAction(evt);
            evt.target.animation.start("hoverAnimation");
        });

        SDButton.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (evt) => {
            this.hoverOutAction(evt);
            evt.target.animation.start("hoverOutAnimation");
        });

        SDButton.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            evt.stopPropagation();

            let playAfter = this.player.isPlaying();
            this.player.switchTo("HD");

            SDButton.parent = null;
            HDButton.parent = this.panel;
            HDButton.position.set(this.width * 0.48, -this.width / 3.02, 0);

            if (playAfter) {
                this.player.play();
            }
        });
    }

    destroy() {
        this.scene.removeEventListener(RODIN.CONST.GAMEPAD_BUTTON_DOWN, this.onButtonDown);
        this.scene.removeEventListener(RODIN.CONST.GAMEPAD_BUTTON_UP, this.onButtonUp);
        this.scene.removeEventListener(RODIN.CONST.UPDATE, this.onUpdate);
    }
}