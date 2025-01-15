"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useChains } from "@/context/ChainsContext";
import { cn } from "@/lib/utils";
import { Validator } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface SelectValidatorProps {
  readonly selectedValidatorAddress: string;
  readonly setValidatorAddress: (validatorAddress: string) => void;
}

export default function SelectValidator({
  selectedValidatorAddress,
  setValidatorAddress,
}: SelectValidatorProps) {
  const {
    validatorState: {
      validators: { bonded, unbonding, unbonded },
    },
  } = useChains();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  // The list of validators includes unbonding and unbonded validators in order to
  // be able to do undelegates and redelegates from jailed validators as well as delegate
  // to validators who are not yet active.
  //
  // If this list becomes too long due to spam registrations, we can try to do some
  // reasonable filtering here.
  const validators = [...bonded, ...unbonding, ...unbonded];

  function displayValidator(val: Validator): string {
    return val.description.moniker + (val.jailed ? " (jailed)" : "");
  }

  const selectedValidator = validators.find(
    (validatorItem) => selectedValidatorAddress === validatorItem.operatorAddress,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="mb-4 w-full max-w-[300px] justify-between border-white bg-fuchsia-900 hover:bg-fuchsia-900"
        >
          {selectedValidatorAddress
            ? selectedValidator
              ? displayValidator(selectedValidator)
              : "Unknown validator"
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
          <CommandEmpty>No validators found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {validators.map((validatorItem) => (
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
                      selectedValidatorAddress === validatorItem.operatorAddress
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {validatorItem.description.moniker + (validatorItem.jailed ? " (jailed)" : "")}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
