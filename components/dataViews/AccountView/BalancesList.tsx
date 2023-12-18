import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coin } from "@cosmjs/amino";
import { StargateClient } from "@cosmjs/stargate";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useChains } from "../../../context/ChainsContext";
import BalancePill from "./BalancePill";

interface BalancesListProps {
  readonly walletAddress: string;
  readonly setError: Dispatch<SetStateAction<string>>;
}

export default function BalancesList({ walletAddress, setError }: BalancesListProps) {
  const { chain } = useChains();
  const [balances, setBalances] = useState<readonly Coin[]>([]);

  useEffect(() => {
    (async function () {
      if (!walletAddress) {
        return;
      }

      try {
        const client = await StargateClient.connect(chain.nodeAddress);
        const newBalances = await client.getAllBalances(walletAddress);
        setBalances(newBalances);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to get balances");
        console.error("Get balances error:", e);
      }
    })();
  }, [chain.nodeAddress, setError, walletAddress]);

  return balances.length ? (
    <Card className="bg-fuchsia-850 w-full max-w-md border-transparent">
      <CardHeader className="p-0">
        <CardTitle>Balances</CardTitle>
      </CardHeader>
      <CardContent className="mt-4 flex flex-wrap gap-2 p-0">
        {balances.map((coin) => (
          <BalancePill key={coin.denom} coin={coin} />
        ))}
      </CardContent>
    </Card>
  ) : null;
}
