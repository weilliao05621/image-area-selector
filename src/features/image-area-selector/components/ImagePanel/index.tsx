import { useState } from "react";

// stores
import useSelectionStore from "@/features/image-area-selector/stores/selection";

// components
import ImageUploadPanelLayout from "../ImagePanelLayout";
import ImageUploader from "../ImageUploader";
import UploadedImage from "../UploadedImage";
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
          <ImageAreaSelector imageHeight={image.height}>
            <UploadedImage imageUrl={image.url} />
          </ImageAreaSelector>
        )
      )}
    </ImageUploadPanelLayout>
  );
};

export default ImagePanel;
