import { FAImage } from './components/FAImage';
import { PanableImage } from './components/PanableImage';
import { ZoomableImage } from './components/ZoomableImage';
import { CustomImageViewer } from './modules/CustomImageViewer';
import '@webcomponents/custom-elements';

customElements.define('zoomable-image', ZoomableImage, { extends: 'img' });
customElements.define('panable-image', PanableImage, { extends: 'img' });
customElements.define('fa-image', FAImage, { extends: 'img' });

Object.defineProperties(window, {
    FAImageViewer: {
        get: () => CustomImageViewer
    }
});
