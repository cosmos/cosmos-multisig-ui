import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { printableCoin, thinSpace } from "@/lib/displayHelpers";
import { toastError } from "@/lib/utils";
import { Coin } from "@cosmjs/amino";
import { StargateClient } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { useChains } from "../../context/ChainsContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface BalancesTableProps {
  readonly walletAddress: string;
}

export default function BalancesTable({ walletAddress }: BalancesTableProps) {
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
    <Table>
      <TableBody>
        {balances.map((coin) => {
          const foundAsset = chain.assets.find((asset) => asset.base === coin.denom);
          const logo = foundAsset?.logo_URIs?.svg || foundAsset?.logo_URIs?.png || "";
          const [macroAmount, macroDenom] = printableCoin(coin, chain).split(thinSpace);

          return (
            <TableRow key={coin.denom}>
              <TableCell className="w-0 pr-0">
                <Avatar>
                  <AvatarImage src={logo} alt={`${coin.denom} logo`} className="h-auto" />
                  <AvatarFallback className="text-white">
                    {coin.denom.slice(1, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{macroDenom}</TableCell>
              <TableCell className="text-right">{macroAmount}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  ) : (
    "No tokens found"
  );
}
