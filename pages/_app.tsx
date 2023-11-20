import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/context/ThemesContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChainsProvider } from "../context/ChainsContext";

export default function MultisigApp({ Component, pageProps }: AppProps) {
  return (
    <ChainsProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Header />
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </ChainsProvider>
  );
}
