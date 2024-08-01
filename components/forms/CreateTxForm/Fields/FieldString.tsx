import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { prettyFieldName } from "@/lib/form";
import { fromHex } from "@cosmjs/encoding";
import * as z from "zod";
import type { FieldProps } from "./types";

const isFieldString = (fieldName: string) =>
  ["sourcePort", "sourceChannel", "memo"].includes(fieldName);

const isOptionalFieldString = (fieldName: string) => fieldName === "label";

const isHexFieldString = (fieldName: string) => fieldName === "salt";

export const getFieldString = (fieldName: string) =>
  isFieldString(fieldName) || isOptionalFieldString(fieldName) || isHexFieldString(fieldName)
    ? FieldString
    : null;

export const getFieldStringSchema = (fieldName: string) => {
  if (
    !isFieldString(fieldName) &&
    !isOptionalFieldString(fieldName) &&
    !isHexFieldString(fieldName)
  ) {
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

  if (isHexFieldString(fieldName)) {
    return zodString.transform((val, ctx) => {
      try {
        return fromHex(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be an hexadecimal string",
        });

        return z.NEVER;
      }
    });
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
