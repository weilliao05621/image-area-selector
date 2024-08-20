import styled from "@emotion/styled";

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
  // TODO: fix magic num
  width: 548px;
  height: 703px;
  background-color: #2a3948;
  margin-left: 136px;
`;

const StyledPre = styled.pre`
  color: white;
`;

export default JsonViewer;
