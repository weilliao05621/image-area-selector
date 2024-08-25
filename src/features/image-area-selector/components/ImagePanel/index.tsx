import { useState } from "react";

// components
import ImageUploadPanelLayout from "@/features/image-area-selector/components/ImagePanelLayout";
import ImageUploader from "@/features/image-area-selector/components/ImageUploader";
import UploadedImage from "@/features/image-area-selector/components/UploadedImage";
import ImageAreaSelector from "@/features/image-area-selector/components/ImageAreaSelector";

// types
import type { ImageInfo } from "@/features/image-area-selector/types/image.type";

const ImagePanel = () => {
  const [hasUploadedImage, setHasUploadedImage] = useState<boolean>(false);
  const [image, setImage] = useState<ImageInfo | null>(null);

  return (
    <ImageUploadPanelLayout>
      {!hasUploadedImage ? (
        <ImageUploader
          onUploaded={(_image) => {
            setImage(_image);
            setHasUploadedImage(true);
          }}
        />
      ) : (
        image && (
          <ImageAreaSelector>
            <UploadedImage imageUrl={image.url} />
          </ImageAreaSelector>
        )
      )}
    </ImageUploadPanelLayout>
  );
};

export default ImagePanel;
