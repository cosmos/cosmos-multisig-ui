import CreateMultisigForm from "@/components/forms/CreateMultisigForm";
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

export default function CreateMultisigPage() {
  const { chain } = useChains();

  return (
    <div className="m-4 mt-8 flex max-w-xl flex-1 flex-col justify-center gap-4">
      <Head title={`${chain.chainDisplayName || "Cosmos Hub"} Multisig Manager`} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${chain.registryName || ""}`}>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create multisig</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CreateMultisigForm />
    </div>
  );
}
