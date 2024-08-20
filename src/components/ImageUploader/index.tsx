import { useRef, type ReactNode } from "react";
import styled from "@emotion/styled";

// hooks
import { useUploadImage } from "./hooks";

// types
import type { ImageInfo } from "@/types/image.type";

// constants
import {
  DEFAULT_IMAGE_CONTAINER_HEIGHT,
  MAX_IMAGE_CONTAINER_WIDTH,
} from "@/constants/design.constant";

interface ImageUploaderProps {
  /** @props execute side effect after image uploaded */
  onUploaded: (image: ImageInfo) => void;
  /** @props children display how the upload should be like */
  defaultContent?: ReactNode;
}

/** @description handle input file & generate info of the uploaded image*/
function ImageUploader(props: ImageUploaderProps) {
  // HOOKS
  const inputRef = useRef<HTMLInputElement>(null);
  const setUploadImg = useUploadImage();

  // HANDLERS
  const handleUpload = () => {
    inputRef.current?.click();
  };

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    if (e.target.files! && e.target.files[0]!) {
      const file = e.target.files[0];
      const imageInfo = await setUploadImg(file);
      props.onUploaded(imageInfo);
    }
  };

  // RENDER
  const defaultContent = props?.defaultContent ? (
    props.defaultContent
  ) : (
    <DefaultContentContainer>Upload Image</DefaultContentContainer>
  );

  return (
    <>
      <StyledInput
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
      />
      <ImageContainer onClick={handleUpload}>{defaultContent}</ImageContainer>
    </>
  );
}

export default ImageUploader;

// 0 opacity enable assistive technology interprets to read the input
// check https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#examples
const StyledInput = styled.input`
  opacity: 0;
  height: 0;
`;

const ImageContainer = styled.div`
  max-width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  width: 100%;
  min-height: ${DEFAULT_IMAGE_CONTAINER_HEIGHT}px;
`;

const DefaultContentContainer = styled.div`
  width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  height: ${DEFAULT_IMAGE_CONTAINER_HEIGHT}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  // TODO: 改成 theme
  border-radius: 8px;
  color: #c5c5c7;
  border: 1px solid #d7dbdd;
`;
