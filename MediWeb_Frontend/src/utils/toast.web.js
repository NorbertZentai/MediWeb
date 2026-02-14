import { toast as webToast } from 'react-toastify';

/**
 * Web implementation of toast utility.
 * Uses react-toastify.
 */
export const toast = {
    success: (message) => {
        webToast.success(message);
    },
    error: (message) => {
        webToast.error(message);
    },
    info: (message) => {
        webToast.info(message);
    },
    warn: (message) => {
        webToast.warn(message);
    },
};
