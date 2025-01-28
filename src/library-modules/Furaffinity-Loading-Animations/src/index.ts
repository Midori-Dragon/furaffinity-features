import { LoadingBar } from './components/LoadingBar';
import { LoadingImage } from './components/LoadingImage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LoadingTextSpinner } from './components/LoadingTextSpinner';

Object.defineProperties(window, {
    FALoadingSpinner: { get: () => LoadingSpinner },
    FALoadingTextSpinner: { get: () => LoadingTextSpinner },
    FALoadingImage: { get: () => LoadingImage },
    FALoadingBar: { get: () => LoadingBar }
});
