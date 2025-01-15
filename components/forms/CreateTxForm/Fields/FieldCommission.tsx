import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { prettyFieldName } from "@/lib/form";
import * as z from "zod";
import type { FieldProps } from "./types";

const isFieldCommission = (fieldName: string) => fieldName === "commission";

export const getFieldCommission = (fieldName: string) =>
  isFieldCommission(fieldName) ? FieldCommission : null;

export const getFieldCommissionSchema = (fieldName: string) =>
  isFieldCommission(fieldName)
    ? z.object({
        rate: z.coerce
          .number({ invalid_type_error: "Must be a number", required_error: "Required" })
          .positive("Must be positive")
          .transform((value) => {
            try {
              return String(value);
            } catch {
              return value;
            }
          }),
        maxRate: z.coerce
          .number({ invalid_type_error: "Must be a number", required_error: "Required" })
          .positive("Must be positive")
          .transform((value) => {
            try {
              return String(value);
            } catch {
              return value;
            }
          }),
        maxChangeRate: z.coerce
          .number({ invalid_type_error: "Must be a number", required_error: "Required" })
          .positive("Must be positive")
          .transform((value) => {
            try {
              return String(value);
            } catch {
              return value;
            }
          }),
      })
    : null;

export default function FieldCommission({ form, fieldFormName }: FieldProps) {
  const prettyLabel = prettyFieldName(fieldFormName);

  return (
    <>
      <FormField
        control={form.control}
        name={`${fieldFormName}.rate`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Rate`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter rate" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${fieldFormName}.maxRate`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Max Rate`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter max rate" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${fieldFormName}.maxChangeRate`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Max Change Rate`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter max change rate" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
