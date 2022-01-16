import React from "react";
import { AppWrapper } from "../context/AppContext";

function MultisigApp({ Component, pageProps }) {
  return (
    <AppWrapper>
      <Component {...pageProps} />
    </AppWrapper>
  );
}
export default MultisigApp;
