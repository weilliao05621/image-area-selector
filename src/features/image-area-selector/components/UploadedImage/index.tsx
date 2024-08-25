import styled from "@emotion/styled";

// constants
import { MAX_IMAGE_CONTAINER_WIDTH } from "@/features/image-area-selector/constants/layout.constant";

interface UploadedImageProps {
  imageUrl: string;
}

function UploadedImage(props: UploadedImageProps) {
  return (
    <StyledUploadedImage
      src={props.imageUrl}
      alt="for marquee selections"
      draggable={false}
    />
  );
}

const StyledUploadedImage = styled.img`
  display: block;
  width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  object-fit: contain;
  margin: 0 auto;
`;

export default UploadedImage;
