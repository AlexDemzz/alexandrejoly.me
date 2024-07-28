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
          return loadImage(asset.src);
        } else if (
          asset.endsWith(".webm") ||
          asset.endsWith(".mkv") ||
          asset.endsWith(".mp4")
        ) {
          return loadVideo(asset.src);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
    };

    loadAssets();
  }, [assetPaths]);

  return progress;
};

export default useLoadAssets;
