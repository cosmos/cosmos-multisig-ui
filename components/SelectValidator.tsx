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
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface SelectValidatorProps {
  readonly validatorAddress: string;
  readonly setValidatorAddress: (validatorAddress: string) => void;
}

export default function SelectValidator({
  validatorAddress,
  setValidatorAddress,
}: SelectValidatorProps) {
  const {
    validatorState: { validators },
  } = useChains();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="mb-4 w-full max-w-[300px] justify-between border-white bg-fuchsia-900 hover:bg-fuchsia-900"
        >
          {validatorAddress
            ? validators?.find(
                (validatorItem) => validatorAddress === validatorItem.operatorAddress,
              )?.description.moniker || "Unknown validator"
            : "Select validator…"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command className="bg-fuchsia-900">
          <CommandInput
            placeholder="Search validator…"
            value={searchText}
            onValueChange={setSearchText}
          />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup className="max-h-[400px] overflow-y-auto">
            {validators?.map((validatorItem) => (
              <CommandItem
                className="aria-selected:bg-fuchsia-800"
                key={validatorItem.operatorAddress}
                onSelect={() => {
                  setValidatorAddress(validatorItem.operatorAddress);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    validatorAddress === validatorItem.operatorAddress
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {validatorItem.description.moniker}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
