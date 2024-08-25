import { useState } from "react";

// components
import UploadImage from "./components/ImageUploader";
import MarqueeSelection from "./components/MarqueeSelection";
import MemoImageUploadPanel from "./components/ImageUploadPanel";
import Layout from "./components/Layout";
import ImagePanelContent from "./components/ImagePanelContent";

// store
import useSelectionStore from "./stores/selection/index.store";

// types
import { ImageInfo } from "./types/image.type";

// constants
import { MAX_IMAGE_CONTAINER_WIDTH } from "./constants/layout.constant";
import SelectedAreaDataViewer from "./components/SelectedAreaDataViewer";

// styles
import EmotionThemeProvider from "./theme.style";
import GlobalStyle from "./global.style";

export function App() {
  const [hasUploadedImage, setHasUploadedImage] = useState<boolean>(false);
  const [image, setImage] = useState<ImageInfo | null>(null);

  const imageAspectRadio = useSelectionStore((state) => state.imageAspectRadio);
  const setImageAspectRatio = useSelectionStore(
    (state) => state.setImageAspectRatio,
  );

  return (
    <EmotionThemeProvider>
      <GlobalStyle />
      <Layout>
        <MemoImageUploadPanel>
          {!hasUploadedImage ? (
            <UploadImage
              onUploaded={(image) => {
                setImage(image);
                setImageAspectRatio(MAX_IMAGE_CONTAINER_WIDTH / image.width);
                setHasUploadedImage(true);
              }}
            />
          ) : (
            image && (
              <ImagePanelContent imageUrl={image.url}>
                <MarqueeSelection
                  containerHeight={image.height * imageAspectRadio}
                  constrainX={(x) => [
                    Math.min(Math.max(x, 0), MAX_IMAGE_CONTAINER_WIDTH),
                    x > 0 && x < MAX_IMAGE_CONTAINER_WIDTH,
                  ]}
                  constrainY={(y) => [
                    Math.min(Math.max(y, 0), image.height * imageAspectRadio),
                    y > 0 && y < image.height * imageAspectRadio,
                  ]}
                />
              </ImagePanelContent>
            )
          )}
        </MemoImageUploadPanel>
        <SelectedAreaDataViewer />
      </Layout>
    </EmotionThemeProvider>
  );
}
