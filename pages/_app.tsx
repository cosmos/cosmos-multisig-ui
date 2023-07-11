import type { AppProps } from "next/app";
import ChainSelect from "../components/chainSelect/ChainSelect";
import { ChainsProvider } from "../context/ChainsContext";

function MultisigApp({ Component, pageProps }: AppProps) {
  const showChainSelect = process.env.NEXT_PUBLIC_MULTICHAIN?.toLowerCase() === "true";
  return (
    <ChainsProvider>
      {showChainSelect && <ChainSelect />}
      <Component {...pageProps} />
    </ChainsProvider>
  );
}
export default MultisigApp;
