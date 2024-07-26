import FieldAddress, {
  getFieldAddressSchema,
} from "@/components/forms/CreateTxForm/Fields/FieldAddress";
import FieldAmount, {
  getFieldAmountSchema,
} from "@/components/forms/CreateTxForm/Fields/FieldAmount";
import { FieldSchemaInput } from "@/components/forms/CreateTxForm/Fields/types";
import { z } from "zod";

export const prettyFieldName = (fieldName: string) => {
  const truncatedName = fieldName.slice(fieldName.indexOf(".", "msgs.".length) + 1);
  const splitName = truncatedName.split(/(?=[A-Z])/).join(" ");
  const capitalizedName = splitName.charAt(0).toUpperCase() + splitName.slice(1);

  return capitalizedName;
};

export const getField = (fieldName: string) => {
  if (
    fieldName.toLowerCase().includes("address") ||
    fieldName === "depositor" ||
    fieldName === "proposer" ||
    fieldName === "voter" ||
    fieldName === "sender" ||
    fieldName === "receiver" ||
    fieldName === "admin" ||
    fieldName === "contract" ||
    fieldName === "newAdmin"
  ) {
    return FieldAddress;
  }

  if (
    fieldName === "amount" ||
    fieldName === "initialDeposit" ||
    fieldName === "value" ||
    fieldName === "token" ||
    fieldName === "funds"
  ) {
    return FieldAmount;
  }

  return () => null;
};

const getFieldSchema = (fieldName: string) => {
  if (fieldName === "admin") {
    return (schemaInput: FieldSchemaInput) => z.optional(getFieldAddressSchema(schemaInput));
  }

  if (
    fieldName.toLowerCase().includes("address") ||
    fieldName === "depositor" ||
    fieldName === "proposer" ||
    fieldName === "voter" ||
    fieldName === "sender" ||
    fieldName === "receiver" ||
    fieldName === "contract" ||
    fieldName === "newAdmin"
  ) {
    return getFieldAddressSchema;
  }

  if (
    fieldName === "amount" ||
    fieldName === "initialDeposit" ||
    fieldName === "value" ||
    fieldName === "token" ||
    fieldName === "funds"
  ) {
    return getFieldAmountSchema;
  }

  throw new Error(`No schema found for ${fieldName} field`);
};

export const getMsgSchema = (fieldNames: readonly string[], schemaInput: FieldSchemaInput) => {
  const fieldEntries = fieldNames.map((fieldName) => [
    fieldName,
    getFieldSchema(fieldName)(schemaInput),
  ]);

  return z.object(Object.fromEntries(fieldEntries));
};
