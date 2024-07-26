import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { prettyFieldName } from "@/lib/form";
import * as z from "zod";
import type { FieldProps } from "./types";

const isFieldString = (fieldName: string) =>
  ["sourcePort", "sourceChannel", "memo"].includes(fieldName);

const isOptionalFieldString = (fieldName: string) => fieldName === "label";

export const getFieldString = (fieldName: string) =>
  isFieldString(fieldName) || isOptionalFieldString(fieldName) ? FieldString : null;

export const getFieldStringSchema = (fieldName: string) => {
  if (!isFieldString(fieldName) && !isOptionalFieldString(fieldName)) {
    return null;
  }

  const zodString = z
    .string({ invalid_type_error: "Must be a string", required_error: "Required" })
    .trim()
    .min(1, "Required");

  if (isFieldString(fieldName)) {
    return zodString;
  }

  if (isOptionalFieldString(fieldName)) {
    return z.optional(zodString);
  }

  return null;
};

export default function FieldString({ form, fieldFormName }: FieldProps) {
  const prettyLabel = prettyFieldName(fieldFormName);

  return (
    <FormField
      control={form.control}
      name={fieldFormName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{prettyLabel}</FormLabel>
          <FormControl>
            <Input placeholder={`Enter ${prettyLabel.toLowerCase()}`} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
