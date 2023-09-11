import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/context/ThemesContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import ChainSelect from "../components/chainSelect/ChainSelect";
import { ChainsProvider } from "../context/ChainsContext";

function MultisigApp({ Component, pageProps }: AppProps) {
  const showChainSelect = process.env.NEXT_PUBLIC_MULTICHAIN?.toLowerCase() === "true";
  return (
    <ChainsProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {showChainSelect && <ChainSelect />}
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </ChainsProvider>
  );
}
export default MultisigApp;
