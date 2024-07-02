"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useChains } from "@/context/ChainsContext";
import { getProviders } from "@/lib/pairing";
import { cn, toastError } from "@/lib/utils";
import { sleep } from "@cosmjs/utils";
import { StakeEntry } from "@lavanet/lavajs/dist/codegen/lavanet/lava/epochstorage/stake_entry";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

interface SelectProviderProps {
  readonly chainID: string;
  readonly providerAddress: string;
  readonly setProviderAddress: (providerAddress: string) => void;
}

export default function SelectProvider({
  chainID,
  providerAddress,
  setProviderAddress,
}: SelectProviderProps) {
  const { chain } = useChains();
  const [open, setOpen] = useState(false);
  const [providers, setProviders] = useState<readonly StakeEntry[]>();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let isMounted = true;

    const updateProviders = async () => {
      await sleep(2000);

      if (!isMounted) {
        return;
      }

      try {
        const newProviders = await getProviders(chain.nodeAddress, chainID);

        if (newProviders.length && isMounted) {
          setProviders(newProviders);
        }
      } catch (e) {
        if (!isMounted) {
          return;
        }

        setProviders([]);
        console.error("Failed to get providers:", e);
        toastError({
          description: "Failed to get providers",
          fullError: e instanceof Error ? e : undefined,
        });
      }
    };

    updateProviders();

    return () => {
      isMounted = false;
    };
  }, [chain.nodeAddress, chainID]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="mb-4 w-full max-w-[300px] justify-between border-white bg-fuchsia-900 hover:bg-fuchsia-900"
        >
          {providerAddress
            ? providers?.find((providerItem) => providerAddress === providerItem.address)
                ?.moniker || "Unknown provider"
            : "Select provider…"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command className="bg-fuchsia-900">
          <CommandInput
            placeholder="Search provider…"
            value={searchText}
            onValueChange={setSearchText}
          />
          <CommandEmpty>No provider found.</CommandEmpty>
          <CommandGroup className="max-h-[400px] overflow-y-auto">
            {providers?.map((providerItem) => (
              <CommandItem
                className="aria-selected:bg-fuchsia-800"
                key={providerItem.address}
                onSelect={() => {
                  setProviderAddress(providerItem.address);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    providerAddress === providerItem.address ? "opacity-100" : "opacity-0",
                  )}
                />
                {providerItem.moniker}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
