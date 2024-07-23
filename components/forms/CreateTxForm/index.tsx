import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMsgRegistry } from "@/lib/msg";

export default function CreateTxForm() {
  console.log({ msgRegistry: getMsgRegistry() });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new transaction</CardTitle>
        <CardDescription>You can add several different messages.</CardDescription>
      </CardHeader>
      <CardContent>Here will be the future improved form</CardContent>
    </Card>
  );
}
