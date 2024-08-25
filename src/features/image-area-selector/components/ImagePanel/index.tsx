import { useState } from "react";

// stores
import useSelectionStore from "@/features/image-area-selector/stores/selection";

// components
import ImageUploadPanelLayout from "../ImagePanelLayout";
import ImageUploader from "../ImageUploader";
import UploadedImage from "../UploadedImage";
import ScrollableRelativeContainer from "../ScrollableRelativeContainer";
import ImageAreaSelector from "../ImageAreaSelector";

// constants
import { MAX_IMAGE_CONTAINER_WIDTH } from "@/features/image-area-selector/constants/layout.constant";

// types
import type { ImageInfo } from "@/features/image-area-selector/types/image.type";

const ImagePanel = () => {
  const [hasUploadedImage, setHasUploadedImage] = useState<boolean>(false);
  const [image, setImage] = useState<ImageInfo | null>(null);

  const setImageAspectRatio = useSelectionStore(
    (state) => state.setImageAspectRatio,
  );

  const imageAspectRadio = useSelectionStore((state) => state.imageAspectRadio);

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
          <ScrollableRelativeContainer>
            <UploadedImage imageUrl={image.url} />
            <ImageAreaSelector
              containerHeight={imageAspectRadio * image.height}
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
