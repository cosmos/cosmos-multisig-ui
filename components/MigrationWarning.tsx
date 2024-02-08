import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MigrationWarning() {
  return (
    <Alert className="mx-auto my-4 max-w-md border-yellow-300 bg-fuchsia-900">
      <AlertTitle>Warning!</AlertTitle>
      <AlertDescription className="mt-3">
        This app will no longer be available at this URL from March 1st, 2024.
      </AlertDescription>
      <AlertDescription className="mt-3">
        A new instance is deployed at{" "}
        <a href="https://multisig.confio.run" target="_blank" className="text-blue-400">
          https://multisig.confio.run
        </a>
        , connecting to a new database. You can start using this instance for new signing requests.
        Re-importing multisigs by address or public keys may be needed.
      </AlertDescription>
      <AlertDescription className="mt-3">
        Any pending transactions on this app will be lost when that time arrives. In the meantime,
        both deployments can be used but no data is shared between them.
      </AlertDescription>
    </Alert>
  );
}
