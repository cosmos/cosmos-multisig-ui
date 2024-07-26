import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { prettyFieldName } from "@/lib/form";
import * as z from "zod";
import type { FieldProps } from "./types";

const isFieldBoolean = (fieldName: string) => ["delayed", "fixMsg"].includes(fieldName);

export const getFieldBoolean = (fieldName: string) =>
  isFieldBoolean(fieldName) ? FieldBoolean : null;

export const getFieldBooleanSchema = (fieldName: string) =>
  isFieldBoolean(fieldName)
    ? z.coerce.boolean({ invalid_type_error: "Must be a boolean", required_error: "Required" })
    : null;

export default function FieldBoolean({ form, fieldFormName }: FieldProps) {
  return (
    <FormField
      control={form.control}
      name={fieldFormName}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{prettyFieldName(fieldFormName)}</FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
