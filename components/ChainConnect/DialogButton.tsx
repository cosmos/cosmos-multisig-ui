import { useChains } from "@/context/ChainsContext";
import { isChainInfoFilled } from "@/context/ChainsContext/helpers";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DialogTrigger } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";

export function ChainHeader() {
  const { chain } = useChains();

  return isChainInfoFilled(chain) ? (
    <>
      <Avatar>
        <AvatarImage src={chain.logo} alt={`${chain.chainDisplayName} logo`} />
        <AvatarFallback>{chain.registryName.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <h1>{chain.chainDisplayName} Multisig</h1>
    </>
  ) : (
    <>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </>
  );
}

export default function DialogButton() {
  const showChainSelect = process.env.NEXT_PUBLIC_MULTICHAIN?.toLowerCase() === "true";

  return showChainSelect ? (
    <DialogTrigger>
      <div className="group relative m-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-white p-2.5 text-sm font-medium text-white hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-100">
        <ChainHeader />
      </div>
    </DialogTrigger>
  ) : (
    <div className="group relative m-1 inline-flex items-center justify-center gap-2 p-2.5 text-sm font-medium text-white">
      <ChainHeader />
    </div>
  );
}
