import { useEffect } from 'react';
import { allMediaData } from '../data/mediaData';

/**
 * Custom hook to preload images and videos from the gallery.
 * This runs once when the component using it mounts.
 */
const useMediaPreloader = () => {
    useEffect(() => {
        // Preload Images
        const preloadImage = (src) => {
            if (!src) return;
            const img = new Image();
            img.src = src;
        };

        // Preload Videos
        const preloadVideo = (src) => {
            if (!src) return;
            const video = document.createElement('video');
            video.src = src;
            video.preload = 'auto';
            video.muted = true; // Required for some browsers to allow preloading

            // Start loading but don't play
            video.load();
        };

        // Execute preloading for all media items
        // We use requestIdleCallback if available to avoid blocking the main thread
        const startPreloading = () => {
            allMediaData.forEach((media) => {
                if (media.type === 'image') {
                    preloadImage(media.src);
                } else if (media.type === 'video') {
                    if (media.src) preloadVideo(media.src);
                    if (media.webm) preloadVideo(media.webm);
                    if (media.poster) preloadImage(media.poster);
                }
            });
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(startPreloading);
        } else {
            setTimeout(startPreloading, 1000); // Small delay to prioritize initial render
        }
    }, []);
};

export default useMediaPreloader;
