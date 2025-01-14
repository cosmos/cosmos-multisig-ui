import { useChains } from "@/context/ChainsContext";
import { setNewConnection } from "@/context/ChainsContext/helpers";
import { RegistryAsset } from "@/types/chainRegistry";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const JsonEditor = dynamic(() => import("../inputs/JsonEditor"), { ssr: false });

export default function CustomChainForm() {
  const { chain, chains, newConnection, chainsDispatch } = useChains();
  const [showAssetsEditor, setShowAssetsEditor] = useState(false);

  useEffect(() => {
    // Unblock the main thread
    setTimeout(() => {
      setShowAssetsEditor(true);
    }, 0);
  }, []);

  const formSchema = z
    .object({
      localRegistryName: z
        .string({ required_error: "Local registry name is required" })
        .refine((val) => !chains.mainnets.has(val) && !chains.testnets.has(val), {
          message: "Name already exists in remote registry",
        }),
      chainName: z.string({ required_error: "Chain name is required" }),
      chainId: z.string({ required_error: "Chain ID is required" }),
      baseDenom: z.string({ required_error: "Base denom is required" }),
      displayDenom: z.string({ required_error: "Display denom is required" }),
      denomExponent: z.string({ required_error: "Denom exponent is required" }),
      bech32Prefix: z.string({ required_error: "Address prefix is required" }),
      gasPrice: z.string({ required_error: "Gas price is required" }),
      rpcNodes: z.string({ required_error: "Comma separated rpc nodes are required" }),
      explorerTxLink: z.string({ required_error: "Explorer tx url is required" }),
      explorerAccountLink: z.string({ required_error: "Explorer account url is required" }),
      logo: z.string({ required_error: "Logo url is required" }),
      assets: z.string({ required_error: "Assets json is required" }),
    })
    .required();

  const defaultChain = newConnection.chain ?? chain;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      localRegistryName: defaultChain.registryName,
      chainName: defaultChain.chainDisplayName,
      chainId: defaultChain.chainId,
      baseDenom: defaultChain.denom,
      displayDenom: defaultChain.displayDenom,
      denomExponent: String(defaultChain.displayDenomExponent),
      bech32Prefix: defaultChain.addressPrefix,
      gasPrice: defaultChain.gasPrice,
      rpcNodes: defaultChain.nodeAddresses.join(", "),
      explorerTxLink: defaultChain.explorerLinks.tx,
      explorerAccountLink: defaultChain.explorerLinks.account,
      logo: defaultChain.logo,
      assets: JSON.stringify(defaultChain.assets),
    },
  });

  function onSubmit(chainFromForm: z.infer<typeof formSchema>) {
    const rpcNodes = chainFromForm.rpcNodes.split(", ");

    setNewConnection(chainsDispatch, {
      action: "confirm",
      chain: {
        registryName: chainFromForm.localRegistryName,
        logo: chainFromForm.logo,
        chainId: chainFromForm.chainId,
        chainDisplayName: chainFromForm.chainName,
        nodeAddress: "",
        nodeAddresses: rpcNodes,
        denom: chainFromForm.baseDenom,
        displayDenom: chainFromForm.displayDenom,
        displayDenomExponent: Number(chainFromForm.denomExponent),
        assets: JSON.parse(chainFromForm.assets) as RegistryAsset[],
        gasPrice: chainFromForm.gasPrice,
        addressPrefix: chainFromForm.bech32Prefix,
        explorerLinks: {
          tx: chainFromForm.explorerTxLink,
          account: chainFromForm.explorerAccountLink,
        },
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            name="localRegistryName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local Registry Name</FormLabel>
                <FormControl>
                  <Input placeholder="mynetwork" className="border-white" {...field} />
                </FormControl>
                <FormDescription>
                  A unique key to store this chain on your local registry
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="chainName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chain Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Network" className="border-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="chainId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chain ID</FormLabel>
                <FormControl>
                  <Input placeholder="my-net-4" className="border-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="baseDenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Denom</FormLabel>
                <FormControl>
                  <Input placeholder="umycoin" className="border-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="displayDenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Denom</FormLabel>
                <FormControl>
                  <Input placeholder="MYCOIN" className="border-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="denomExponent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Denom Exponent</FormLabel>
                <FormControl>
                  <Input placeholder="6" className="border-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="bech32Prefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Prefix</FormLabel>
                <FormControl>
                  <Input placeholder="mynet" className="border-white" {...field} />
                </FormControl>
                <FormDescription>Needs to be bech32</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="gasPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gas Price</FormLabel>
                <FormControl>
                  <Input placeholder="0.04umycoin" className="border-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="explorerTxLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Explorer Tx Link</FormLabel>
                <FormControl>
                  <Input placeholder="url" className="border-white" {...field} />
                </FormControl>
                <FormDescription>with {"'${txHash}'"} included</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="explorerAccountLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Explorer Account Link</FormLabel>
                <FormControl>
                  <Input placeholder="url" className="border-white" {...field} />
                </FormControl>
                <FormDescription>with {"'${accountAddress}'"} included</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="rpcNodes"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>RPC nodes</FormLabel>
              <FormControl>
                <Input placeholder="url1, url2, …, urln" className="border-white" {...field} />
              </FormControl>
              <FormDescription>Can be one or more, separated by commas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URI</FormLabel>
              <FormControl>
                <Input placeholder="logo" className="border-white" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showAssetsEditor ? (
          <FormField
            name="assets"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Assets</FormLabel>
                <FormControl>
                  <div>
                    <JsonEditor
                      content={{ text: field.value }}
                      onChange={(newMsgContent) => {
                        field.onChange(
                          "text" in newMsgContent ? (newMsgContent.text ?? "{}") : "{}",
                        );
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <Button type="submit" className="mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
}
