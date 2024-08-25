import styled from "@emotion/styled";

// components
import ImagePanel from "./components/ImagePanel";
import SelectedAreaDataViewer from "./components/SelectedAreaDataViewer";

function ImageAreaSelectorFeature() {
  return (
    <Layout>
      <ImagePanel />
      <SelectedAreaDataViewer />
    </Layout>
  );
}

const Layout = styled.div`
  padding: 24px;
  display: flex;
  justify-content: center;
`;

export default ImageAreaSelectorFeature;
