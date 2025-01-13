import { useChains } from "@/context/ChainsContext";
import { setNewConnection } from "@/context/ChainsContext/helpers";
import { ChainInfo } from "@/context/ChainsContext/types";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CommandItem } from "../ui/command";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import ChainDigest from "./ChainDigest";

interface ChainItemProps {
  readonly chain: ChainInfo;
  readonly hoverCardElementBoundary: HTMLDivElement | null;
}

export default function ChainItem({ chain, hoverCardElementBoundary }: ChainItemProps) {
  const { chain: connectedChain, chainsDispatch } = useChains();

  return (
    <HoverCard key={chain.registryName} openDelay={300}>
      <HoverCardTrigger asChild>
        <CommandItem
          value={chain.registryName}
          onSelect={
            connectedChain.registryName === chain.registryName
              ? () => {}
              : () => {
                  setNewConnection(chainsDispatch, { action: "confirm", chain });
                }
          }
          className={cn(
            "group relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-white p-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-red-100 aria-selected:text-gray-900",
            connectedChain.registryName === chain.registryName
              ? "cursor-not-allowed border-green-600 bg-green-300 text-green-900 aria-selected:bg-green-300"
              : "transparent cursor-pointer border-white",
          )}
        >
          {connectedChain.registryName === chain.registryName ? (
            <CheckCircle
              style={{
                position: "absolute",
                top: "-6px",
                left: "-6px",
                border: "2px solid rgb(134 239 172 / var(--tw-bg-opacity))",
                borderRadius: "50%",
                width: "25px",
                height: "25px",
                background: "rgb(134 239 172 / var(--tw-bg-opacity))",
                color: "rgb(20 83 45 / var(--tw-text-opacity))",
              }}
            />
          ) : null}
          <Avatar>
            <AvatarImage
              src={chain.logo}
              alt={`${chain.chainDisplayName} logo`}
              className="h-auto"
            />
            <AvatarFallback>{chain.registryName.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          {chain.registryName}
        </CommandItem>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-auto bg-fuchsia-900"
        collisionBoundary={hoverCardElementBoundary}
      >
        <ChainDigest chain={chain} />
      </HoverCardContent>
    </HoverCard>
  );
}
