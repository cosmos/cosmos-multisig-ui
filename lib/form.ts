import FieldAddress, {
  getFieldAddressSchema,
} from "@/components/forms/CreateTxForm/Fields/FieldAddress";
import { FieldSchemaInput } from "@/components/forms/CreateTxForm/Fields/types";
import { z } from "zod";

export const prettyFieldName = (fieldName: string) => {
  const splitName = fieldName.split(/(?=[A-Z])/).join(" ");
  const capitalizedName = splitName.charAt(0).toUpperCase() + splitName.slice(1);

  return capitalizedName;
};

export const getField = (fieldName: string) => {
  switch (fieldName) {
    case "fromAddress":
    case "toAddress":
    case "delegatorAddress":
    case "validatorAddress":
      return FieldAddress;
    default:
      return () => null;
  }
};

const getFieldSchema = (fieldName: string) => {
  switch (fieldName) {
    case "fromAddress":
    case "toAddress":
    case "delegatorAddress":
    case "validatorAddress":
      return getFieldAddressSchema;
    default:
      throw new Error(`No schema found for ${fieldName} field`);
  }
};

export const getMsgSchema = (fieldNames: readonly string[], schemaInput: FieldSchemaInput) => {
  const fieldEntries = fieldNames.map((fieldName) => [
    fieldName,
    getFieldSchema(fieldName)(schemaInput),
  ]);

  return z.object(Object.fromEntries(fieldEntries));
};
