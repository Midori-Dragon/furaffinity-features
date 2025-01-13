import { CustomPage } from './modules/CustomPage';

Object.defineProperties(window, {
    FACustomPage: { get: () => CustomPage }
});
