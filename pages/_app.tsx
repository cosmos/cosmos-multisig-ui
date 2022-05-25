import React from "react";
import { AppWrapper } from "../context/AppContext";
import ChainSelect from "../components/chainSelect/ChainSelect";
import type { AppProps } from "next/app";

function MultisigApp({ Component, pageProps }: AppProps) {
  return (
    <AppWrapper>
      {process.env.NEXT_PUBLIC_MULTICHAIN!.toLowerCase() === "true" && <ChainSelect />}
      <Component {...pageProps} />
    </AppWrapper>
  );
}
export default MultisigApp;
