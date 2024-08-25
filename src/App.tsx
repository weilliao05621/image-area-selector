// styles
import EmotionThemeProvider from "./styles/theme.style";
import GlobalStyle from "./styles/global.style";

export function App() {
  return (
    <EmotionThemeProvider>
      <GlobalStyle />
      <div>Your code starts here</div>
    </EmotionThemeProvider>
  );
}
