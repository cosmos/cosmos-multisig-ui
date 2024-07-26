import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChains } from "@/context/ChainsContext";
import { exampleAddress } from "@/lib/displayHelpers";
import { prettyFieldName } from "@/lib/form";
import { assert } from "@cosmjs/utils";
import * as z from "zod";
import type { FieldProps, FieldSchemaInput } from "./types";

const isFieldAddress = (fieldName: string) =>
  fieldName.toLowerCase().includes("address") ||
  ["depositor", "proposer", "voter", "sender", "receiver", "contract", "newAdmin"].includes(
    fieldName,
  );

const isOptionalFieldAddress = (fieldName: string) => fieldName === "admin";

export const getFieldAddress = (fieldName: string) =>
  isFieldAddress(fieldName) || isOptionalFieldAddress(fieldName) ? FieldAddress : null;

export const getFieldAddressSchema = (fieldName: string, { chain }: FieldSchemaInput) => {
  assert(chain, "Could not get field address schema because of missing chain parameter");

  if (!isFieldAddress(fieldName) && !isOptionalFieldAddress(fieldName)) {
    return null;
  }

  const zodString = z
    .string({ invalid_type_error: "Must be a string", required_error: "Required" })
    .trim()
    .min(1, "Required")
    .startsWith(chain.addressPrefix, `Invalid prefix for ${chain.chainDisplayName}`);

  if (isFieldAddress(fieldName)) {
    return zodString;
  }

  if (isOptionalFieldAddress(fieldName)) {
    return z.optional(zodString);
  }

  return null;
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
