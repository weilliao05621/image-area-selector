import styled from "@emotion/styled";

// components
import ImagePanel from "./components/ImagePanel";

function ImageAreaSelectorFeature() {
  return (
    <Layout>
      <ImagePanel />
    </Layout>
  );
}

const Layout = styled.div`
  padding: 24px;
  display: flex;
  justify-content: center;
`;

export default ImageAreaSelectorFeature;
