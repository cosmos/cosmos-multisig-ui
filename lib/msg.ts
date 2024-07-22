import { txCosmJsTypes } from "@/types/cosmjs-types";
import { createWasmAminoConverters } from "@cosmjs/cosmwasm-stargate";
import { createDefaultAminoConverters } from "@cosmjs/stargate";

export const aminoConverters = {
  ...createDefaultAminoConverters(),
  ...createWasmAminoConverters(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const msgRegistry: Record<string, any> = {};

const codecs = txCosmJsTypes
  .filter(
    (type) =>
      typeof type === "object" &&
      "typeUrl" in type &&
      "encode" in type &&
      "decode" in type &&
      "fromJSON" in type &&
      "toJSON" in type &&
      "fromPartial" in type,
  )
  .filter((type) => Object.keys(aminoConverters).includes(type.typeUrl));

for (const codec of codecs) {
  const splitTypeUrl = codec.typeUrl.split(".");
  const name = splitTypeUrl[splitTypeUrl.length - 1];
  const category = splitTypeUrl[0] === "/cosmos" ? splitTypeUrl[1] : splitTypeUrl[0].slice(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emptyMsg = (codec as any).fromPartial({});

  msgRegistry[codec.typeUrl] = {
    typeUrl: codec.typeUrl,
    category,
    name,
    fields: Object.keys(emptyMsg),
    emptyMsg,
    codec,
  };
}

export const getMsgRegistry = () => msgRegistry;
