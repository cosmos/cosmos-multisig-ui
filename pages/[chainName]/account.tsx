import AccountView from "@/components/dataViews/AccountView";
import Page from "@/components/layout/Page";
import { useChains } from "@/context/ChainsContext";

export default function AccountPage() {
  const { chain } = useChains();

  return (
    <Page
      goBack={
        chain.registryName ? { pathname: `/${chain.registryName}`, title: "home" } : undefined
      }
    >
      <AccountView />
    </Page>
  );
}
