import { RateLimiter } from '../../../GlobalUtils/src/RateLimiter';

export const DEFAULT_REQUEST_INTERVAL = 500;

// Shared by every FuraffinityRequests instance in this script context
export const globalRateLimiter = new RateLimiter(DEFAULT_REQUEST_INTERVAL);
