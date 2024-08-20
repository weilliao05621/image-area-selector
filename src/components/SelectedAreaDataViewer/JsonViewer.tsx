import styled from "@emotion/styled";

// constants
import {
  MAX_VIEWER_HEIGHT,
  MAX_VIEWER_WIDTH,
} from "@/constants/layout.constant";

function isFilledArray(data: unknown) {
  return Array.isArray(data) && data.length > 0;
}

function isPlainObjectWithKeys(data: unknown) {
  return (
    data !== null && typeof data === "object" && Object.keys(data).length > 0
  );
}

interface JsonViewerProps {
  data: unknown;
  hideEmptyContent?: boolean;
  jsonSpace?: number;
}

function JsonViewer(props: JsonViewerProps) {
  const content = props.hideEmptyContent
    ? isFilledArray(props.data) || isPlainObjectWithKeys(props.data)
      ? props.data
      : undefined
    : props.data;

  return (
    <Wrapper>
      {!!content && (
        <StyledPre>
          {JSON.stringify(props.data, null, props.jsonSpace ?? 2)}
        </StyledPre>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: ${MAX_VIEWER_WIDTH}px;
  height: ${MAX_VIEWER_HEIGHT}px;
  background-color: ${(props) => props.theme.color.panel.bg.code};
  margin-left: 136px;
`;

const StyledPre = styled.pre`
  color: white;
`;

export default JsonViewer;
