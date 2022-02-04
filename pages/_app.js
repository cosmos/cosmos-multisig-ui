import React from "react";
import { AppWrapper } from "../context/AppContext";
import ChainSelect from "../components/chainSelect/ChainSelect";

function MultisigApp({ Component, pageProps }) {
  return (
    <AppWrapper>
      {process.env.NEXT_PUBLIC_MULTICHAIN && <ChainSelect />}
      <Component {...pageProps} />
    </AppWrapper>
  );
}
export default MultisigApp;
