import { FuraffinityRequests } from './modules/FuraffinityRequests';

Object.defineProperties(window, {
    FARequestHelper: { get: () => FuraffinityRequests }
});
