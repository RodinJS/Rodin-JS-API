//Created by xgharibyan
import {room} from './room.js';
import {screen} from './screen.js';
import {space} from './space.js';
import {floor} from './floor.js';
import {sky} from './sky.js';

const env = {
    mode: 'light',
    enterDarkMode: enterDarkMode
};

function enterDarkMode() {
   if(env.mode === 'dark') return;
   room.object3D.parent.remove(room.object3D);
   sky.object3D.parent.remove(sky.object3D);
   screen.unlock();
   space.show();
   floor.animate();
   env.mode = 'dark';
}

export {env};