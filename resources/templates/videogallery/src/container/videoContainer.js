import { videos } from '../data/videos.js';
import { Thumbnail } from '../components/Thumbnail.js';
import { linearView, cylindricalView, gridView } from '../components/Gallery.js';
import { VideoPlayer } from './videoPlayerConatainer.js';

/**
 * Here we create 3 different layouts for thumbnails and a video player
 * Layout types are;
 * linear
 * flat
 * cylinder
 */
export class VideoContainer {
    constructor(blinkAnimation) {
        this.blinkAnimation  = blinkAnimation;
        this.videoPlayer = new VideoPlayer();
        this.thumbs = videos.map(v => new Thumbnail(v, this.videoPlayer, this.blinkAnimation));
    }

    setView(type = 'linear') {
        type = type.toLowerCase();
        switch (type) {
            case 'linear':
                linearView(this.thumbs);
                break;
            case 'flat':
                gridView(this.thumbs);
                break;
            case 'cylinder':
                cylindricalView(this.thumbs);
                break;
            default:
                linearView(this.thumbs);
        }
    }
}