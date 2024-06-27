import { ChainInfo } from "@/context/ChainsContext/types";
import { useEffect, useRef, useState } from "react";
import { CommandGroup } from "../ui/command";
import ChainItem from "./ChainItem";

interface ChainsGroupProps {
  readonly chains: readonly ChainInfo[];
  readonly heading: string;
  readonly emptyMsg: string;
}

export default function ChainsGroup({ chains, heading, emptyMsg }: ChainsGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numChainsToRender, setNumChainsToRender] = useState(10);

  useEffect(() => {
    // Unblock the main thread
    setTimeout(() => {
      if (numChainsToRender < chains.length) {
        setNumChainsToRender((prev) => prev + 10);
      }
    }, 0);
  }, [chains.length, numChainsToRender]);

  return (
    <CommandGroup
      heading={heading}
      className="[&_[cmdk-group-heading]]:my-3 [&_[cmdk-group-heading]]:text-base [&_[cmdk-group-heading]]:leading-[0] [&_[cmdk-group-heading]]:text-white [&_[cmdk-group-heading]]:underline"
    >
      {chains.length ? (
        <div ref={containerRef} className="flex flex-wrap gap-2">
          {chains.slice(0, numChainsToRender).map((chain) => (
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
