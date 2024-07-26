import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useChains } from "@/context/ChainsContext";
import { getField, getMsgSchema } from "@/lib/form";
import { getMsgRegistry } from "@/lib/msg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

type MsgType = Readonly<{
  url: string;
  key: string;
}>;

export default function CreateTxForm() {
  const { chain } = useChains();
  const [msgTypes, setMsgTypes] = useState<readonly MsgType[]>([]);

  const msgRegistry = getMsgRegistry();
  const categories = [...new Set(Object.values(msgRegistry).map((msg) => msg.category))];

  const basicCreateTxSchema = z.object({
    memo: z.string().trim().min(1, "Required"),
    msgs: z.object({}),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const msgsSchema: Record<string, z.ZodObject<any>> = {};

  for (const msgType of msgTypes) {
    msgsSchema[msgType.key] = getMsgSchema(msgRegistry[msgType.url].fields, { chain });
  }

  const createTxSchema = basicCreateTxSchema.extend({ msgs: z.object(msgsSchema) });

  const createTxForm = useForm<z.infer<typeof createTxSchema>>({
    resolver: zodResolver(createTxSchema),
  });

  const addMsg = (typeUrl: string) => {
    setMsgTypes((oldMsgTypes) => {
      const newMsgTypeUrls: readonly MsgType[] = [
        ...oldMsgTypes,
        { url: typeUrl, key: crypto.randomUUID() },
      ];
      // setGasLimit(gasOfTx(newMsgTypes));
      return newMsgTypeUrls;
    });
    createTxForm.trigger();
  };

  const submitCreateTx = (values: z.infer<typeof createTxSchema>) =>
    console.log("created tx with values:", values);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new transaction</CardTitle>
        <CardDescription>You can add several different messages.</CardDescription>
      </CardHeader>
      <CardContent>
        {categories.map((category) => (
          <div key={category}>
            <h3>{category}</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(msgRegistry)
                .filter((msg) => msg.category === category)
                .map((msg) => (
                  <Button
                    key={msg.typeUrl}
                    onClick={() => addMsg(msg.typeUrl)}
                    disabled={
                      msg.fields.map((f: string) => getField(f)).some((v: string) => v === null) ||
                      Object.values(getMsgSchema(msg.fields, { chain }).shape).some(
                        (v) => v === null,
                      )
                    }
                  >
                    Add {msg.name.startsWith("Msg") ? msg.name.slice(3) : msg.name}
                  </Button>
                ))}
            </div>
          </div>
        ))}
        <Form {...createTxForm}>
          <form onSubmit={createTxForm.handleSubmit(submitCreateTx)} className="space-y-8">
            {msgTypes.map((type) => {
              const msg = msgRegistry[type.url];
              return (
                <div key={type.key}>
                  <h3>{msg.name}</h3>
                  {msg.fields.map((fieldName: string) => {
                    const Field = getField(fieldName) || (() => null);
                    return (
                      <Field
                        key={fieldName}
                        form={createTxForm}
                        fieldFormName={`msgs.${type.key}.${fieldName}`}
                      />
                    );
                  })}
                </div>
              );
            })}
            <Button type="submit">Create TX</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
