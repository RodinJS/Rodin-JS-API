import * as RODIN from 'rodin/core';
export function loader() {
    let loading = new RODIN.Plane(3,4);
    loading._threeObject.material.map = RODIN.Loader.loadTexture('./src/assets/env.jpg');
    RODIN.Scene.add(loading)
}