import AccountView from "@/components/dataViews/AccountView";
import Head from "@/components/head";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useChains } from "@/context/ChainsContext";
import Link from "next/link";

export default function AccountPage() {
  const { chain } = useChains();

  return (
    <div className="m-4 mt-8 flex max-w-xl flex-1 flex-col justify-center gap-4">
      <Head title={`${chain.chainDisplayName || "Cosmos Hub"} Multisig Manager`} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              {chain.registryName ? <Link href={`/${chain.registryName}`}>Home</Link> : null}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Account</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <AccountView />
    </div>
  );
}
