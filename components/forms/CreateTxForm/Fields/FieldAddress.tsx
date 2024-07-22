import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChains } from "@/context/ChainsContext";
import { exampleAddress } from "@/lib/displayHelpers";
import { prettyFieldName } from "@/lib/form";
import * as z from "zod";
import type { FieldProps, FieldSchemaInput } from "./types";

export const getFieldAddressSchema = ({ chain }: FieldSchemaInput) => {
  if (!chain) {
    throw new Error("Could not get field address schema because of missing chain parameter");
  }

  return z
    .string({ invalid_type_error: "Must be a string", required_error: "Required" })
    .trim()
    .min(1, "Required")
    .startsWith(chain.addressPrefix, `Invalid prefix for ${chain.chainDisplayName}`);
};

export default function FieldAddress({ form, fieldFormName }: FieldProps) {
  const { chain } = useChains();

  return (
    <FormField
      control={form.control}
      name={fieldFormName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{prettyFieldName(fieldFormName)}</FormLabel>
          <FormControl>
            <Input placeholder={`E.g. "${exampleAddress(0, chain.addressPrefix)}"`} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
