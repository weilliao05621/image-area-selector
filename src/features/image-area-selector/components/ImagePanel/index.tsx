import { useState, useRef, useLayoutEffect } from "react";

// stores
import useSelectionStore from "@/features/image-area-selector/stores/selection";

// components
import ImageUploadPanelLayout from "../ImagePanelLayout";
import ImageUploader from "../ImageUploader";
import UploadedImage from "../UploadedImage";
import ScrollableRelativeContainer from "../ScrollableRelativeContainer";
import ImageAreaSelector from "../ImageAreaSelector";

// constants
import {
  MAX_IMAGE_CONTAINER_WIDTH,
  MAX_IMAGE_UPLOAD_PANEL_CONTENT_WIDTH,
} from "@/features/image-area-selector/constants/layout.constant";

// types
import type { ImageInfo } from "@/features/image-area-selector/types/image.type";

const ImagePanel = () => {
  const [hasUploadedImage, setHasUploadedImage] = useState<boolean>(false);
  const [image, setImage] = useState<ImageInfo | null>(null);

  const [containerLeft, setContainerLeft] = useState<number>(0);

  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);

  const setImageAspectRatio = useSelectionStore(
    (state) => state.setImageAspectRatio,
  );

  const imageAspectRadio = useSelectionStore((state) => state.imageAspectRadio);

  useLayoutEffect(() => {
    const elm = scrollableContainerRef.current;
    if (!elm) return;
    setContainerLeft(
      (MAX_IMAGE_UPLOAD_PANEL_CONTENT_WIDTH -
        MAX_IMAGE_CONTAINER_WIDTH -
        (elm.offsetWidth - elm.clientWidth)) / // detect scrollbar width
        2,
    );
  }, [image]);

  return (
    <ImageUploadPanelLayout>
      {!hasUploadedImage ? (
        <ImageUploader
          onUploaded={(_image) => {
            setImage(_image);
            setImageAspectRatio(MAX_IMAGE_CONTAINER_WIDTH / _image.width);
            setHasUploadedImage(true);
          }}
        />
      ) : (
        image && (
          <ScrollableRelativeContainer ref={scrollableContainerRef}>
            <UploadedImage imageUrl={image.url} />
            <ImageAreaSelector
              containerHeight={imageAspectRadio * image.height}
              containerLeft={containerLeft}
              constrainX={(x) => [
                Math.min(Math.max(x, 0), MAX_IMAGE_CONTAINER_WIDTH),
                x > 0 && x < MAX_IMAGE_CONTAINER_WIDTH,
              ]}
              constrainY={(y) => [
                Math.min(Math.max(y, 0), image.height * imageAspectRadio),
                y > 0 && y < image.height * imageAspectRadio,
              ]}
            />
          </ScrollableRelativeContainer>
        )
      )}
    </ImageUploadPanelLayout>
  );
};

export default ImagePanel;
