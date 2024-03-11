import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toastError } from "@/lib/utils";
import { Coin } from "@cosmjs/amino";
import { StargateClient } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { useChains } from "../../../context/ChainsContext";
import BalancePill from "./BalancePill";

interface BalancesListProps {
  readonly walletAddress: string;
}

export default function BalancesList({ walletAddress }: BalancesListProps) {
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
      } catch (e) {
        console.error("Failed to get balances:", e);
        toastError({
          description: "Failed to get balances",
          fullError: e instanceof Error ? e : undefined,
        });
      }
    })();
  }, [chain.nodeAddress, walletAddress]);

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
