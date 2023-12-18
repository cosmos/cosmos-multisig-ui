import { useChains } from "@/context/ChainsContext";
import { setChain, setNewConnection } from "@/context/ChainsContext/helpers";
import { useRouter } from "next/router";
import { Button } from "../ui/button";
import ChainDigest from "./ChainDigest";

interface ConfirmConnectionProps {
  readonly closeDialog: () => void;
}

export default function ConfirmConnection({ closeDialog }: ConfirmConnectionProps) {
  const router = useRouter();
  const { chain, newConnection, chainsDispatch } = useChains();

  if (newConnection.action !== "confirm") {
    return null;
  }

  return (
    <>
      <h3>
        Disconnect from "{chain.registryName}" and connect to "{newConnection.chain.registryName}"?
      </h3>
      <p className="max-w-none">
        You will be redirected to the homepage and any filled form will be lost
      </p>
      <div
        className="flex flex-wrap items-center justify-around gap-4"
        style={{ "--border": "0, 100%, 100%" } as React.CSSProperties}
      >
        <div className="rounded-md border border-white p-4">
          <ChainDigest chain={chain} simplify />
        </div>
        <div className="rounded-md border border-white p-4">
          <ChainDigest chain={newConnection.chain} simplify />
        </div>
      </div>
      <div className="flex gap-4">
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => {
            setNewConnection(chainsDispatch, { ...newConnection, action: "edit" });
          }}
        >
          Edit chain
        </Button>
        <Button
          className="mt-4"
          onClick={() => {
            setChain(chainsDispatch, newConnection.chain);
            closeDialog();
            router.push("/");
          }}
        >
          Connect
        </Button>
      </div>
    </>
  );
}
