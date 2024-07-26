import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { prettyFieldName } from "@/lib/form";
import * as z from "zod";
import type { FieldProps } from "./types";

export const getFieldAmountSchema = () =>
  z.object({
    denom: z
      .string({ invalid_type_error: "Must be a string", required_error: "Required" })
      .trim()
      .min(1, "Required"),
    amount: z
      .number({ invalid_type_error: "Must be a number", required_error: "Required" })
      .positive("Must be positive"),
  });

export default function FieldAmount({ form, fieldFormName }: FieldProps) {
  const prettyLabel = prettyFieldName(fieldFormName);

  return (
    <>
      <FormField
        control={form.control}
        name={`${fieldFormName}.denom`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} denom`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter denom" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${fieldFormName}.amount`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {prettyLabel === "Amount" ? "Amount quantity" : `${prettyLabel} amount`}
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter amount" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
