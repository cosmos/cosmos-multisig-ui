import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChainInfo } from "@/context/ChainsContext/types";
import { StargateClient } from "@cosmjs/stargate";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { NextRouter, withRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useChains } from "../../context/ChainsContext";
import { exampleAddress } from "../../lib/displayHelpers";

const existsMultisigAccount = async (chain: ChainInfo, address: string) => {
  try {
    const client = await StargateClient.connect(chain.nodeAddress);
    const accountOnChain = await client.getAccount(address);
    return accountOnChain !== null;
  } catch {
    return false;
  }
};

interface FindMultisigFormProps {
  router: NextRouter;
}

const FindMultisigForm = ({ router }: FindMultisigFormProps) => {
  const { chain } = useChains();

  const findMultisigSchema = z.object({
    address: z
      .string()
      .trim()
      .min(1, "Required")
      .startsWith(chain.addressPrefix, `Invalid prefix for ${chain.chainDisplayName}`)
      .refine(async (address) => await existsMultisigAccount(chain, address), {
        message: "Multisig not found",
      }),
  });

  const findMultisigForm = useForm<z.infer<typeof findMultisigSchema>>({
    resolver: zodResolver(findMultisigSchema),
    defaultValues: { address: "" },
  });

  const submitFindMultisig = ({ address }: z.infer<typeof findMultisigSchema>) =>
    router.push(`/${chain.registryName}/${address}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Already have a multisig on {chain.chainDisplayName || "Cosmos Hub"}?</CardTitle>
        <CardDescription>
          Enter its address below to view its transactions and create new ones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...findMultisigForm}>
          <form onSubmit={findMultisigForm.handleSubmit(submitFindMultisig)} className="space-y-8">
            <FormField
              control={findMultisigForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Multisig address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`E.g. "${exampleAddress(0, chain.addressPrefix)}"`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit">Use this multisig</Button>
              <Button asChild variant="link" className="p-0 text-secondary">
                <Link href={chain.registryName ? `/${chain.registryName}/create` : ""} className="">
                  I don't have a multisig
                </Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default withRouter(FindMultisigForm);
