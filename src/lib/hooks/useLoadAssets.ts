import { useState, useEffect } from "react";

const useLoadAssets = (assetPaths: any) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount += 1;
      setProgress(Math.round((loadedCount / assetPaths.length) * 100));
    };

    const loadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          updateProgress();
          resolve();
        };
        img.onerror = () => {
          updateProgress();
          resolve();
        };
        img.src = src;
      });
    };

    const loadVideo = (src: string) => {
      return new Promise<void>((resolve) => {
        const video = document.createElement("video");
        video.onloadeddata = () => {
          updateProgress();
          resolve();
        };
        video.onerror = () => {
          updateProgress();
          resolve();
        };
        video.src = src;
      });
    };

    const loadAssets = async () => {
      const promises = assetPaths.map((asset: any) => {
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
