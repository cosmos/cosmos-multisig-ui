import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { prettyFieldName } from "@/lib/form";
import * as z from "zod";
import type { FieldProps } from "./types";

const isFieldTimeoutHeight = (fieldName: string) => fieldName === "timeoutHeight";

export const getFieldTimeoutHeight = (fieldName: string) =>
  isFieldTimeoutHeight(fieldName) ? FieldTimeoutHeight : null;

export const getFieldTimeoutHeightSchema = (fieldName: string) =>
  isFieldTimeoutHeight(fieldName)
    ? z.object({
        revisionNumber: z
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
          ),
        revisionHeight: z
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
          ),
      })
    : null;

export default function FieldTimeoutHeight({ form, fieldFormName }: FieldProps) {
  const prettyLabel = prettyFieldName(fieldFormName);

  return (
    <>
      <FormField
        control={form.control}
        name={`${fieldFormName}.revisionNumber`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Revision Number`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter revision number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${fieldFormName}.revisionHeight`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Revision Height`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter revision height" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
