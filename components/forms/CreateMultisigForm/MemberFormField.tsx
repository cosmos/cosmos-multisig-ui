import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ClipboardEventHandler } from "react";
import { UseFieldArrayReplace, UseFormReturn } from "react-hook-form";
import { useChains } from "../../../context/ChainsContext";
import { exampleAddress, examplePubkey } from "../../../lib/displayHelpers";

interface MemberFormFieldProps {
  readonly createMultisigForm: UseFormReturn<{ members: { member: string }[]; threshold: number }>;
  readonly index: number;
  readonly membersReplace: UseFieldArrayReplace<
    { members: { member: string }[]; threshold: number },
    "members"
  >;
}

export default function MemberFormField({
  createMultisigForm,
  index,
  membersReplace,
}: MemberFormFieldProps) {
  const { chain } = useChains();

  const onPaste: ClipboardEventHandler<HTMLInputElement> = (ev) => {
    const rawData = ev.clipboardData.getData("text");
    const csv = rawData.split(",");
    const finalValues =
      csv.length > 1
        ? csv.map((el) => el.trim()).filter((el) => el !== "")
        : rawData
            .replace(/\n/g, " ")
            .split(" ")
            .map((el) => el.trim())
            .filter((el) => el !== "");

    membersReplace(finalValues.map((el) => ({ member: el })));

    ev.preventDefault();
  };

  return (
    <FormField
      control={createMultisigForm.control}
      name={`members.${index}.member`}
      render={() => (
        <FormItem>
          <FormLabel>Member #{index + 1}</FormLabel>
          <FormDescription>Address or public key</FormDescription>
          <FormControl>
            <Input
              placeholder={`E.g. "${
                index % 2 === 0 ? exampleAddress(index, chain.addressPrefix) : examplePubkey(index)
              }"`}
              onPaste={index === 0 ? onPaste : undefined}
              {...createMultisigForm.register(`members.${index}.member`)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
