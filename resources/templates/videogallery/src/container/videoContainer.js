import { videos } from '../data/videos.js';
import { Thumbnail } from '../components/Thumbnail.js';
import { linearView, cylindricView, gridView } from '../components/Gallery.js';
import { VideoPlayer } from './videoPlayerConatainer.js';
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
                cylindricView(this.thumbs);
                break;
            default:
                linearView(this.thumbs);
        }
    }
}