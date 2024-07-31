import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { prettyFieldName } from "@/lib/form";
import { printVoteOption, voteOptions } from "@/lib/gov";
import { voteOptionFromJSON } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import * as z from "zod";
import type { FieldProps } from "./types";

const selectVoteOptions = voteOptions.map((opt) => {
  const voteOptionObj = voteOptionFromJSON(opt);

  return {
    label: printVoteOption(voteOptionObj),
    value: voteOptionObj,
  };
});

const isFieldVoteOption = (fieldName: string) => fieldName === "option";

export const getFieldVoteOption = (fieldName: string) =>
  isFieldVoteOption(fieldName) ? FieldVoteOption : null;

export const getFieldVoteOptionSchema = (fieldName: string) =>
  isFieldVoteOption(fieldName)
    ? z.coerce
        .number({
          invalid_type_error: "Invalid vote option",
          required_error: "Invalid vote option",
        })
        .nonnegative("Invalid vote option")
    : null;

export default function FieldVoteOption({ form, fieldFormName }: FieldProps) {
  return (
    <FormField
      control={form.control}
      name={fieldFormName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{prettyFieldName(fieldFormName)}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={selectVoteOptions[0].value.toString(10)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a vote option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {selectVoteOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value.toString(10)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
