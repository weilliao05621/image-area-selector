import { useRef } from "react";
import { Brand } from "ts-brand";

// types
import { ImageInfo } from "@/types/image.type";

type UploadObjectUrl = Brand<string, "UploadObjectUrl">;

function createImageInfoPromise(url: UploadObjectUrl): Promise<ImageInfo> {
  return new Promise((res, rej) => {
    try {
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
        rej(e.message);
      }
    }
  });
}

function useUploadImage() {
  const currentObjectUrl = useRef<UploadObjectUrl | null>(null);
  const hasUploaded = useRef<boolean>(false);

  const setObjectUrl = (file: File) => {
    if (currentObjectUrl.current) {
      URL.revokeObjectURL(currentObjectUrl.current);
    }
    currentObjectUrl.current = URL.createObjectURL(file) as UploadObjectUrl;
    return currentObjectUrl.current;
  };

  const setUploadImg = (file: File) => {
    const url = setObjectUrl(file);
    const promiseObj = createImageInfoPromise(url);
    hasUploaded.current = true;
    return promiseObj;
  };

  return setUploadImg;
}

export { useUploadImage };
