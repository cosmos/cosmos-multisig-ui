import ListUserMultisigs from "@/components/dataViews/ListUserMultisigs";
import FindMultisigForm from "@/components/forms/FindMultisigForm";
import Head from "@/components/head";
import { useChains } from "@/context/ChainsContext";
import { useEffect, useState } from "react";

const FindMultisigPage = () => {
  const { chain } = useChains();
  const [fetchedTestObj, setFetchedTestObj] = useState();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log({ fetchedTestObj, greeting: (fetchedTestObj as unknown as any)?.toString() });

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://cdn.jsdelivr.net/gh/abefernan/test-js-obj@HEAD/js-file.js";
    script.async = true;

    script.addEventListener("load", function () {
      // at this moment MyItemData variable is accessible as MyItemData or window.MyItemData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFetchedTestObj((window as unknown as any).testObj);
    });

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="m-4 mt-0 flex max-w-xl flex-1 flex-col justify-center gap-4">
      <Head title={`${chain.chainDisplayName || "Cosmos Hub"} Multisig Manager`} />
      <FindMultisigForm />
      <ListUserMultisigs />
    </div>
  );
};

export default FindMultisigPage;
