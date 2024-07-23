import { FieldSchemaInput } from "@/components/forms/CreateTxForm/Fields/types";
import { z } from "zod";

export const prettyFieldName = (fieldName: string) => {
  const splitName = fieldName.split(/(?=[A-Z])/).join(" ");
  const capitalizedName = splitName.charAt(0).toUpperCase() + splitName.slice(1);

  return capitalizedName;
};

export const getField = (_fieldName: string) => {
  /* Will return a FormField component per fieldName */
  return () => null;
};

const getFieldSchema = (_fieldName: string) => {
  /* Will return a zod schema getter per fieldName */
  return (_schemaInput: unknown) => null;
};

export const getMsgSchema = (fieldNames: readonly string[], schemaInput: FieldSchemaInput) => {
  const fieldEntries = fieldNames.map((fieldName) => [
    fieldName,
    getFieldSchema(fieldName)(schemaInput),
  ]);

  return z.object(Object.fromEntries(fieldEntries));
};
