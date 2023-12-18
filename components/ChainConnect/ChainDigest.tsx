import { useChains } from "@/context/ChainsContext";
import { deleteLocalChainFromStorage } from "@/context/ChainsContext/storage";
import { ChainInfo } from "@/context/ChainsContext/types";
import { CheckCircle, ChevronsUpDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import ButtonWithConfirm from "../inputs/ButtonWithConfirm";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

interface ChainItemProps {
  readonly chain: ChainInfo;
  readonly simplify?: boolean;
}

export default function ChainDigest({ chain, simplify }: ChainItemProps) {
  const { chain: connectedChain, chains } = useChains();

  return (
    <div className="space-y-1">
      <div className="column flex flex-wrap items-center gap-2">
        <Avatar className="overflow-visible">
          {!simplify && connectedChain.registryName === chain.registryName ? (
            <CheckCircle
              style={{
                position: "absolute",
                top: "-6px",
                left: "-6px",
                border: "2px solid rgb(134 239 172 / var(--tw-bg-opacity))",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                background: "rgb(134 239 172 / var(--tw-bg-opacity))",
                color: "rgb(20 83 45 / var(--tw-text-opacity))",
              }}
            />
          ) : null}
          <AvatarImage src={chain.logo} alt={`${chain.chainDisplayName} logo`} className="h-auto" />
          <AvatarFallback>{chain.registryName.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h4 className="text-sm font-semibold">{chain.chainDisplayName}</h4>
        <Badge>{chain.chainId}</Badge>
      </div>
      <h4 className="text-sm font-semibold">Fee token: {chain.displayDenom}</h4>
      <Collapsible className="w-[350px] space-y-2">
        <div className="flex items-center space-x-4">
          {!simplify && chain.nodeAddresses.length > 1 ? (
            <CollapsibleTrigger asChild>
              <Button size="sm" className="p-1">
                <ChevronsUpDown className="black h-4 w-4" />
                <span className="sr-only">Toggle</span>
                <h4 className="text-sm font-semibold">RPC endpoints:</h4>
              </Button>
            </CollapsibleTrigger>
          ) : (
            <h4 className="text-sm font-semibold">RPC endpoint:</h4>
          )}
        </div>
        <div className="rounded-md border px-2 py-1 font-mono text-sm">
          {chain.nodeAddress || chain.nodeAddresses[0]}
        </div>
        <CollapsibleContent className="space-y-2">
          {chain.nodeAddresses
            .filter(
              (address, _, nodeAddresses) =>
                (chain.nodeAddress && address !== chain.nodeAddress) ||
                (!chain.nodeAddress && address !== nodeAddresses[0]),
            )
            .map((address) => (
              <div key={address} className="rounded-md border px-2 py-1 font-mono text-sm">
                {address}
              </div>
            ))}
        </CollapsibleContent>
      </Collapsible>
      {!simplify && chains.localnets.has(chain.registryName) ? (
        <div className="flex justify-center pt-2">
          <ButtonWithConfirm
            onClick={() => {
              deleteLocalChainFromStorage(chain.registryName, chains);
            }}
            text="Delete custom chain"
            confirmText="Confirm deletion?"
            disabled={connectedChain.registryName === chain.registryName}
          />
        </div>
      ) : !simplify ? (
        <div className="flex items-center pt-2 hover:cursor-pointer">
          <ExternalLink className="mr-2 h-4 w-4" />
          <Link
            href={`https://github.com/cosmos/chain-registry/tree/master/${
              chains.testnets.has(chain.registryName) ? `testnets/` : ""
            }${chain.registryName}`}
            target="_blank"
            className="text-xs underline"
          >
            Check it out on the registry
          </Link>
        </div>
      ) : null}
    </div>
  );
}
