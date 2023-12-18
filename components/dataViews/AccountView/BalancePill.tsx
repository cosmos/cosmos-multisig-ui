import { printableCoin } from "@/lib/displayHelpers";
import { Coin } from "@cosmjs/amino";
import { useChains } from "../../../context/ChainsContext";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";

interface BalancePillProps {
  readonly coin: Coin;
}

export default function BalancePill({ coin }: BalancePillProps) {
  const { chain } = useChains();

  const foundAsset = chain.assets.find((asset) => asset.base === coin.denom);
  const logo = foundAsset?.logo_URIs?.svg || foundAsset?.logo_URIs?.png || "";
  const macroCoin = printableCoin(coin, chain);

  return (
    <Badge key={coin.denom} className="px-1">
      <Avatar className="mr-2">
        <AvatarImage src={logo} alt={`${coin.denom} logo`} className="h-auto" />
        <AvatarFallback className="text-white">
          {coin.denom.slice(1, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {macroCoin}
    </Badge>
  );
}
