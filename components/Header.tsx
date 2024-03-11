import { useChains } from "@/context/ChainsContext";
import { UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import ChainConnect from "./ChainConnect";

export default function Header() {
  const { pathname } = useRouter();
  const { chain } = useChains();

  return (
    <header className="flex w-full flex-row items-center justify-between gap-4 bg-fuchsia-900 px-3">
      <ChainConnect />
      <Link
        href={
          pathname.includes(chain.registryName)
            ? {
                pathname: "account",
                query: { chainName: chain.registryName },
              }
            : `/${chain.registryName}/account`
        }
        className="h-10 w-10 rounded-full hover:outline-dashed hover:outline-white focus:outline-dashed focus:outline-white"
      >
        <UserCircle2 className="h-full w-auto" />
      </Link>
    </header>
  );
}
