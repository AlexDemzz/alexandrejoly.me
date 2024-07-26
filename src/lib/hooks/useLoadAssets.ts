import { useState, useEffect } from "react";

const useLoadAssets = (assetPaths) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount += 1;
      setProgress(Math.round((loadedCount / assetPaths.length) * 100));
    };

    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          updateProgress();
          resolve();
        };
        img.onerror = () => {
          updateProgress();
          resolve(); // Consider error as a complete load to avoid blocking
        };
        img.src = src;
      });
    };

    const loadVideo = (src) => {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.onloadeddata = () => {
          updateProgress();
          resolve();
        };
        video.onerror = () => {
          updateProgress();
          resolve(); // Consider error as a complete load to avoid blocking
        };
        video.src = src;
      });
    };

    const loadAssets = async () => {
      const promises = assetPaths.map((asset) => {
        if (asset.src) {
          if (
            asset.src.endsWith(".webm") ||
            asset.src.endsWith(".mp4") ||
            asset.src.endsWith(".m3u8")
          ) {
            return loadVideo(asset.src);
          } else {
            return loadImage(asset.src);
          }
        } else if (asset.sources && asset.sources[0].src) {
          return loadVideo(asset.sources[0].src);
        }
        return Promise.resolve(); // Skip if no src or sources are found
      });

      await Promise.all(promises);
    };

    loadAssets();
  }, [assetPaths]);

  return progress;
};

export default useLoadAssets;
