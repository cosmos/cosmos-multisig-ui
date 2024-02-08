import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MigrationWarning() {
  return (
    <Alert className="mx-auto my-4 max-w-md border-yellow-300 bg-fuchsia-900">
      <AlertTitle>Warning!</AlertTitle>
      <AlertDescription className="mt-3">
        This app will no longer be found at this url from March the 1st.
      </AlertDescription>
      <AlertDescription className="mt-3">
        It will instead be accessible from{" "}
        <a href="https://multisig.confio.run" target="_blank" className="text-blue-400">
          https://multisig.confio.run
        </a>
        .
      </AlertDescription>
      <AlertDescription className="mt-3">
        Any pending transactions on this app will be lost when that time arrives.
      </AlertDescription>
    </Alert>
  );
}
