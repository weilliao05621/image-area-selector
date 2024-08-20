import type { ReactNode } from "react";

import { ThemeProvider } from "@emotion/react";

// constants
import { THEME } from "./constants/theme.constant";

function EmotionThemeProvider(props: { children: ReactNode }) {
  return <ThemeProvider theme={THEME}>{props.children}</ThemeProvider>;
}

export default EmotionThemeProvider;
