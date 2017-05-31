import * as RODIN from 'rodin/core';
import {Thumbnail} from "./Thumbnail.js";

let view = null;

export const setView = (thumbs, viewNumber) => {

    let lastCenter = null;

    if (view && view.sculpt) {
        RODIN.Scene.remove(view.sculpt);
        view.sculpt = null;
        lastCenter = view.center;
    }
    view = null;

    switch (viewNumber) {
        case 0:
            view = new RODIN.HorizontalGrid(4, 1, 1.1, 1.8);
            view.sculpt.position.set(0, 2.1, -3);

            break;
        case 1:
            view = new RODIN.HorizontalGrid(5, 2, 1.1, 1.8);
            view.sculpt.position.set(0, 2.5, -3);

            break;
        case 2:
            view = new RODIN.VerticalSemiCircleGrid(5, 2, 0.5, 1.8, 3);
            view.sculpt.position.set(0, 2.5, -3);

            break;
    }

    view.onShow((elem, index, alpha) => {
        elem.visible = true;
    });

    view.onHide((elem, index, alpha) => {
        elem.parent = null;
        // boxes[index] = null;
        elem.position.set(0, 0, -5);
        elem.visible = false;
    });
    //view.onMove(()=>{});
    view.setGetElement((index) => {
        if (index < 0)
            return;

        if (index >= thumbs.length)
            return;
        if (!thumbs[index].element) {
            thumbs[index].draw(index);
            thumbs[index].position.set(0, 0, -5);
        }
        return thumbs[index];
    });
    if (lastCenter)
        view.center = lastCenter;

    // view.on(RODIN.CONST.SCROLL_END, () => {
    //     Thumbnail.reset(view.sculpt);
    // });

    RODIN.Scene.add(view.sculpt);

};

export function linearView(thumbs) {
    setView(thumbs, 0);
}

export function gridView(thumbs) {
    setView(thumbs, 1);
}

export function cylindricView(thumbs) {
    setView(thumbs, 2);
}