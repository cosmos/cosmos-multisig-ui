import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { prettyFieldName } from "@/lib/form";
import * as z from "zod";
import type { FieldProps } from "./types";

const isFieldNumberBigInt = (fieldName: string) =>
  ["proposalId", "creationHeight", "endTime", "timeoutTimestamp", "codeId"].includes(fieldName);

const isFieldNumberString = (fieldName: string) =>
  ["minSelfDelegation", "commissionRate"].includes(fieldName);

export const getFieldNumber = (fieldName: string) =>
  isFieldNumberBigInt(fieldName) || isFieldNumberString(fieldName) ? FieldNumber : null;

export const getFieldNumberSchema = (fieldName: string) => {
  if (isFieldNumberBigInt(fieldName)) {
    return z
      .any()
      .transform((value) => {
        try {
          return BigInt(value);
        } catch {
          return value;
        }
      })
      .pipe(
        z
          .bigint({ invalid_type_error: "Must be an integer", required_error: "Required" })
          .positive("Must be positive"),
      );
  }

  if (isFieldNumberString(fieldName)) {
    return z.coerce
      .number({ invalid_type_error: "Must be a number", required_error: "Required" })
      .positive("Must be positive")
      .transform((value) => {
        try {
          return String(value);
        } catch {
          return value;
        }
      });
  }

  return null;
};

export default function FieldNumber({ form, fieldFormName }: FieldProps) {
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
