// styles
import EmotionThemeProvider from "./styles/theme.style";
import GlobalStyle from "./styles/global.style";
import ImageUploader from "./features/image-area-selector/components/ImageUploader";

export function App() {
  return (
    <EmotionThemeProvider>
      <GlobalStyle />
      <div>Your code starts here</div>
      <ImageUploader onUploaded={(_image) => console.log(_image)} />
    </EmotionThemeProvider>
  );
}
