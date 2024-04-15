import FindMultisigForm from "@/components/forms/FindMultisigForm";
import Head from "@/components/head";
import { useChains } from "@/context/ChainsContext";

const FindMultisigPage = () => {
  const { chain } = useChains();

  return (
    <div className="m-4 mt-0 flex max-w-xl flex-1 flex-col justify-center gap-4">
      <Head title={`${chain.chainDisplayName || "Cosmos Hub"} Multisig Manager`} />
      <FindMultisigForm />
    </div>
  );
};

export default FindMultisigPage;
