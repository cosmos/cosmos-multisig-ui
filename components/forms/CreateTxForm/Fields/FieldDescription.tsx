import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { prettyFieldName } from "@/lib/form";
import * as z from "zod";
import type { FieldProps } from "./types";

const isFieldDescription = (fieldName: string) => fieldName === "description";

export const getFieldDescription = (fieldName: string) =>
  isFieldDescription(fieldName) ? FieldDescription : null;

export const getFieldDescriptionSchema = (fieldName: string) =>
  isFieldDescription(fieldName)
    ? z.object({
        moniker: z
          .string({ invalid_type_error: "Must be a string", required_error: "Required" })
          .trim()
          .min(1, "Required"),
        identity: z
          .string({ invalid_type_error: "Must be a string", required_error: "Required" })
          .trim()
          .min(1, "Required"),
        website: z
          .string({ invalid_type_error: "Must be a string", required_error: "Required" })
          .trim()
          .url("Must be a url")
          .min(1, "Required"),
        securityContact: z
          .string({ invalid_type_error: "Must be a string", required_error: "Required" })
          .trim()
          .min(1, "Required"),
        details: z
          .string({ invalid_type_error: "Must be a string", required_error: "Required" })
          .trim()
          .min(1, "Required"),
      })
    : null;

export default function FieldDescription({ form, fieldFormName }: FieldProps) {
  const prettyLabel = prettyFieldName(fieldFormName);

  return (
    <>
      <FormField
        control={form.control}
        name={`${fieldFormName}.moniker`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Moniker`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter moniker" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${fieldFormName}.identity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Identity`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter identity" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${fieldFormName}.website`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Website`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter website" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${fieldFormName}.securityContact`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Security Contact`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter security contact" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${fieldFormName}.details`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{`${prettyLabel} Details`}</FormLabel>
            <FormControl>
              <Input placeholder="Enter details" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
