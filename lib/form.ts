import {
  getFieldAddress,
  getFieldAddressSchema,
  getFieldAmount,
  getFieldAmountSchema,
  getFieldBoolean,
  getFieldBooleanSchema,
  getFieldCommission,
  getFieldCommissionSchema,
  getFieldDescription,
  getFieldDescriptionSchema,
  getFieldNumber,
  getFieldNumberSchema,
  getFieldString,
  getFieldStringSchema,
  getFieldTimeoutHeight,
  getFieldTimeoutHeightSchema,
  getFieldVoteOption,
  getFieldVoteOptionSchema,
} from "@/components/forms/CreateTxForm/Fields";
import { FieldSchemaInput } from "@/components/forms/CreateTxForm/Fields/types";
import { z } from "zod";

export const prettyFieldName = (fieldName: string) => {
  const truncatedName = fieldName.slice(fieldName.indexOf(".", "msgs.".length) + 1);
  const splitName = truncatedName.split(/(?=[A-Z])/).join(" ");
  const capitalizedName = splitName.charAt(0).toUpperCase() + splitName.slice(1);

  return capitalizedName;
};

export const getField = (fieldName: string) =>
  getFieldAddress(fieldName) ||
  getFieldAmount(fieldName) ||
  getFieldString(fieldName) ||
  getFieldNumber(fieldName) ||
  getFieldBoolean(fieldName) ||
  getFieldTimeoutHeight(fieldName) ||
  getFieldDescription(fieldName) ||
  getFieldCommission(fieldName) ||
  getFieldVoteOption(fieldName) ||
  null;

const getFieldSchema = (fieldName: string, schemaInput: FieldSchemaInput) =>
  getFieldAddressSchema(fieldName, schemaInput) ||
  getFieldAmountSchema(fieldName) ||
  getFieldStringSchema(fieldName) ||
  getFieldNumberSchema(fieldName) ||
  getFieldBooleanSchema(fieldName) ||
  getFieldTimeoutHeightSchema(fieldName) ||
  getFieldDescriptionSchema(fieldName) ||
  getFieldCommissionSchema(fieldName) ||
  getFieldVoteOptionSchema(fieldName) ||
  null;

export const getMsgSchema = (fieldNames: readonly string[], schemaInput: FieldSchemaInput) => {
  const fieldEntries = fieldNames.map((fieldName) => [
    fieldName,
    getFieldSchema(fieldName, schemaInput),
  ]);

  return z.object(Object.fromEntries(fieldEntries));
};
