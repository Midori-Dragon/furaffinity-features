import { CustomImageViewer } from './modules/CustomImageViewer';

Object.defineProperties(window, {
    FAImageViewer: {
        get: () => CustomImageViewer
    }
});
