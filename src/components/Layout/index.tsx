import { type ReactNode } from "react";

import styled from "@emotion/styled";

function Layout(props: { children: ReactNode }) {
  return <StyledLayout>{props.children}</StyledLayout>;
}

const StyledLayout = styled.div`
  padding: 24px;
  display: flex;
  justify-content: center;
`;

export default Layout;
