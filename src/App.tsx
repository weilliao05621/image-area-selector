// features
import ImageAreaSelectorFeature from "@/features/image-area-selector";

// styles
import EmotionThemeProvider from "./styles/theme.style";
import GlobalStyle from "./styles/global.style";

export function App() {
  return (
    <EmotionThemeProvider>
      <GlobalStyle />
      <ImageAreaSelectorFeature />
    </EmotionThemeProvider>
  );
}
