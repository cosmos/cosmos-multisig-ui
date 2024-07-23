import { ChainInfo } from "@/context/ChainsContext/types";
import { UseFormReturn } from "react-hook-form";

export interface FieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly form: UseFormReturn<any>;
  readonly fieldFormName: string;
}

export type FieldSchemaInput = {
  readonly chain?: ChainInfo;
};
