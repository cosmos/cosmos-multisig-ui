import Header from "@/components/Header";
import GeneralNews from "@/components/GeneralNews";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeProvider from "@/context/ThemesContext";
import type { AppProps } from "next/app";
import { ChainsProvider } from "../context/ChainsContext";
import "@/styles/globals.css";

export default function MultisigApp({ Component, pageProps }: AppProps) {
  return (
    <ChainsProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <div className="flex min-h-screen flex-col items-center gap-4">
            <Header />
            <GeneralNews active={true} />
            <Component {...pageProps} />
          </div>
          <Toaster
            richColors
            closeButton
            duration={999999}
            /* This need to be overriden or else it doesn't apply the custom styles. A bug from shadcn probably https://github.com/shadcn-ui/ui/issues/2254 */
            toastOptions={{
              classNames: {
                toast:
                  "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                error:
                  "group-[.toaster]:!bg-destructive group-[.toaster]:!text-destructive-foreground",
                success: "group-[.toaster]:!bg-green-500 group-[.toaster]:!text-white",
                description: "group-[.toast]:text-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              },
            }}
          />
        </TooltipProvider>
      </ThemeProvider>
    </ChainsProvider>
  );
}
