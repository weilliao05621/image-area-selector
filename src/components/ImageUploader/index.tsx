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
} from "@/constants/layout.constant";

interface ImageUploaderProps {
  /** @props execute side effect after image uploaded */
  onUploaded: (image: ImageInfo) => void;
  /** @props children display how the upload should be like */
  actionReminderContent?: ReactNode;
}

/** @description handle input file & generate info of the uploaded image */
function ImageUploader(props: ImageUploaderProps) {
  // HOOKS
  const inputRef = useRef<HTMLInputElement>(null);
  const getUploadedImagePromise = useUploadImage();

  // HANDLERS
  const handleUpload = () => {
    inputRef.current?.click();
  };

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    if (e.target.files! && e.target.files[0]!) {
      const file = e.target.files[0];
      const imageInfo = await getUploadedImagePromise(file);
      props.onUploaded(imageInfo);
    }
  };

  // RENDER
  const actionReminder = props?.actionReminderContent ? (
    props.actionReminderContent
  ) : (
    <DefaultUploadReminder>Upload Image</DefaultUploadReminder>
  );

  return (
    <>
      <StyledInput
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
      />
      <UploadActionBlock onClick={handleUpload}>
        {actionReminder}
      </UploadActionBlock>
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

const UploadActionBlock = styled.div`
  max-width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  min-height: ${DEFAULT_IMAGE_CONTAINER_HEIGHT}px;
`;

const DefaultUploadReminder = styled.div`
  width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  height: ${DEFAULT_IMAGE_CONTAINER_HEIGHT}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  border-radius: ${(props) => props.theme.borderRadius.lg};
  color: ${(props) => props.theme.icon.color.gray};
  border: 1px solid ${(props) => props.theme.color.border[0]};
`;
