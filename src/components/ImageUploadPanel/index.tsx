import { memo, type ReactNode } from "react";

import styled from "@emotion/styled";

// constants
import {
  IMAGE_UPLOAD_PANEL_HEADER_HEIGHT,
  MAX_IMAGE_UPLOAD_PANEL_HEIGHT,
  MAX_IMAGE_UPLOAD_PANEL_CONTENT_WIDTH,
} from "@/constants/layout.constant";

interface ImageUploadPanelProps {
  children: ReactNode;
  avatar?: ReactNode;
}

function ImageUploadPanel(props: ImageUploadPanelProps) {
  return (
    <Layout>
      <Header>
        <AvatarWrapper>{props.avatar && props.avatar}</AvatarWrapper>
      </Header>
      <ContentWrapper>{props.children}</ContentWrapper>
    </Layout>
  );
}

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: ${MAX_IMAGE_UPLOAD_PANEL_CONTENT_WIDTH}px;
  height: ${MAX_IMAGE_UPLOAD_PANEL_HEIGHT}px;
  background-color: ${(props) => props.theme.color.panel.bg.image};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${(props) => props.theme.color.palette.black}60 0px 20px 30px -10px;
`;

const Header = styled.div`
  height: ${IMAGE_UPLOAD_PANEL_HEADER_HEIGHT}px;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.color.panel.header};
`;

const AvatarWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${(props) => props.theme.icon.size.lg};
  height: ${(props) => props.theme.icon.size.lg};
  border-radius: ${(props) => props.theme.borderRadius.full};
  background-color: ${(props) => props.theme.icon.color.gray[1]};
  margin: 12px 24px;
`;

const ContentWrapper = styled.div`
  padding: 80px 48px;
`;

const MemoImageUploadPanel = memo(ImageUploadPanel);

export default MemoImageUploadPanel;
