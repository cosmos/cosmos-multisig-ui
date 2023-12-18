import { ChainInfo } from "@/context/ChainsContext/types";
import { CommandGroup } from "../ui/command";
import ChainItem from "./ChainItem";
import { useRef } from "react";

interface ChainsGroupProps {
  readonly chains: readonly ChainInfo[];
  readonly heading: string;
  readonly emptyMsg: string;
}

export default function ChainsGroup({ chains, heading, emptyMsg }: ChainsGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <CommandGroup
      heading={heading}
      className="[&_[cmdk-group-heading]]:my-3 [&_[cmdk-group-heading]]:text-base [&_[cmdk-group-heading]]:leading-[0] [&_[cmdk-group-heading]]:text-white [&_[cmdk-group-heading]]:underline"
    >
      {chains.length ? (
        <div ref={containerRef} className="flex flex-wrap gap-2">
          {chains.map((chain) => (
            <ChainItem
              key={chain.registryName}
              chain={chain}
              hoverCardElementBoundary={containerRef.current}
            />
          ))}
        </div>
      ) : (
        <p className="ml-3 max-w-none">{emptyMsg}</p>
      )}
    </CommandGroup>
  );
}
