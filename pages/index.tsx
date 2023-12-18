import Page from "@/components/layout/Page";
import StackableContainer from "@/components/layout/StackableContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { isChainInfoFilled } from "@/context/ChainsContext/helpers";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useChains } from "../context/ChainsContext";

export default function MultiPage() {
  const router = useRouter();
  const { chain } = useChains();

  useEffect(() => {
    if (isChainInfoFilled(chain)) {
      router.replace(`/${chain.registryName}`);
    }
  }, [chain, router]);

  return (
    <Page>
      <StackableContainer base>
        <div className="space-y-10">
          <StackableContainer>
            <Skeleton className="h-4 w-[250px]" />
          </StackableContainer>
          <div className="space-y-8">
            <StackableContainer>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[350px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </StackableContainer>
            <StackableContainer>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[280px]" />
              </div>
            </StackableContainer>
          </div>
        </div>
      </StackableContainer>
    </Page>
  );
}
