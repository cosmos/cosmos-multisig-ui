import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getKeplrKey } from "@/lib/keplr";
import { toastError } from "@/lib/utils";
import { StargateClient } from "@cosmjs/stargate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useChains } from "../../../context/ChainsContext";
import { createMultisigFromCompressedSecp256k1Pubkeys } from "../../../lib/multisigHelpers";
import ConfirmCreateMultisig from "./ConfirmCreateMultisig";
import MemberFormField from "./MemberFormField";
import { getCreateMultisigSchema } from "./formSchema";

export default function CreateMultisigForm() {
  const router = useRouter();
  const { chain } = useChains();

  const createMultisigSchema = getCreateMultisigSchema(chain);

  const createMultisigForm = useForm<z.infer<typeof createMultisigSchema>>({
    resolver: zodResolver(createMultisigSchema),
    defaultValues: { members: [{ member: "" }, { member: "" }], threshold: 2 },
  });

  const {
    fields: membersFields,
    append: membersAppend,
    remove: membersRemove,
    replace: membersReplace,
  } = useFieldArray({ name: "members", control: createMultisigForm.control });

  const watchedMembers = useWatch({ control: createMultisigForm.control, name: "members" });

  useEffect(() => {
    if (watchedMembers.every(({ member }) => member !== "")) {
      membersAppend({ member: "" }, { shouldFocus: false });
      createMultisigForm.trigger();
    }

    if (
      watchedMembers.length > 2 &&
      watchedMembers.filter(({ member }) => member === "").length > 1
    ) {
      const memberToRemove = watchedMembers.findIndex(({ member }) => member === "");
      membersRemove(memberToRemove);
      createMultisigForm.trigger();
    }
  }, [createMultisigForm, membersAppend, membersRemove, watchedMembers]);

  useEffect(() => {
    const numMembers = watchedMembers.filter(({ member }) => member !== "").length;
    createMultisigForm.setValue("threshold", Math.max(2, numMembers));
  }, [createMultisigForm, watchedMembers]);

  const submitCreateMultisig = async () => {
    try {
      // Caution: threshold is string instead of number
      const { members, threshold } = createMultisigForm.getValues();

      const pubkeys = await Promise.all(
        members
          .filter(({ member }) => member !== "")
          .map(async ({ member }) => {
            if (!member.startsWith(chain.addressPrefix)) {
              return member;
            }

            const client = await StargateClient.connect(chain.nodeAddress);
            const accountOnChain = await client.getAccount(member);

            if (!accountOnChain || !accountOnChain.pubkey) {
              throw new Error(
                `Member "${member}" is not a pubkey and is not on chain. It needs to send a transaction to appear on chain or you can provide its pubkey`,
              );
            }

            return String(accountOnChain.pubkey.value);
          }),
      );

      const { bech32Address: address } = await getKeplrKey(chain.chainId);

      const multisigAddress = await createMultisigFromCompressedSecp256k1Pubkeys(
        pubkeys,
        Number(threshold),
        chain.addressPrefix,
        chain.chainId,
        address,
      );

      router.push(`/${chain.registryName}/${multisigAddress}`);
    } catch (e) {
      console.error("Failed to create multisig:", e);
      toastError({
        description: "Failed to create multisig",
        fullError: e instanceof Error ? e : undefined,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create multisig</CardTitle>
          <CardDescription>
            <p className="mt-2">
              Fill the form to create a new multisig account on{" "}
              {chain.chainDisplayName || "Cosmos Hub"}.
            </p>
            <p className="mt-2">
              You can paste several addresses on the first input if they are separated by whitespace
              or commas.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...createMultisigForm}>
            <form
              id="create-multisig-form"
              onSubmit={createMultisigForm.handleSubmit(submitCreateMultisig)}
              className="space-y-4"
            >
              {membersFields.map((arrayField, index) => (
                <MemberFormField
                  key={arrayField.id}
                  createMultisigForm={createMultisigForm}
                  index={index}
                  membersReplace={membersReplace}
                />
              ))}
              <FormField
                control={createMultisigForm.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold</FormLabel>
                    <FormDescription>
                      Number of signatures needed to broadcast a transaction
                    </FormDescription>
                    <FormControl className="">
                      <div className="flex items-center gap-2">
                        <Input className="w-20" placeholder="2" {...field} />
                        <span className="text-sm text-muted-foreground">
                          out of{" "}
                          <em className="text-base font-bold not-italic text-white">
                            {watchedMembers.filter(({ member }) => member !== "").length}
                          </em>{" "}
                          members
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ConfirmCreateMultisig createMultisigForm={createMultisigForm} />
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
