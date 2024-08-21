import { useRef } from "react";
import { Brand } from "ts-brand";

// types
import { ImageInfo } from "@/types/image.type";

type UploadObjectUrl = Brand<string, "UploadObjectUrl">;

const DEFAULT_RESOLVED_IMAGE = { width: 0, height: 0, url: "" };

function createImageInfoPromise(
  file: File,
  getUrl: (file: File) => UploadObjectUrl,
): Promise<ImageInfo> {
  return new Promise((res) => {
    try {
      const url = getUrl(file);
      const img = new Image();
      img.onload = () => {
        const imageInfo = {
          width: img.width,
          height: img.height,
          url,
        };
        res(imageInfo);
      };

      img.src = url;
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
        res(DEFAULT_RESOLVED_IMAGE);
      }
    }
  });
}

function useUploadImage() {
  const currentObjectUrl = useRef<UploadObjectUrl | null>(null);

  const setObjectUrl = (file: File) => {
    if (currentObjectUrl.current) {
      URL.revokeObjectURL(currentObjectUrl.current);
    }
    currentObjectUrl.current = URL.createObjectURL(file) as UploadObjectUrl;
    return currentObjectUrl.current;
  };

  const getUploadedImagePromise = (file: File) =>
    createImageInfoPromise(file, setObjectUrl);

  return getUploadedImagePromise;
}

export { useUploadImage };
