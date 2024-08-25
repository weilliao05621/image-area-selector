import { Global, css } from "@emotion/react";

const GlobalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    overflow: hidden;
  }
`;

function GlobalStyle() {
  return <Global styles={GlobalStyles} />;
}

export default GlobalStyle;
