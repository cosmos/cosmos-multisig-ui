import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChains } from "@/context/ChainsContext";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Info } from "lucide-react";
import { UseFormReturn, useFormState } from "react-hook-form";

interface ConfirmCreateMultisigProps {
  readonly createMultisigForm: UseFormReturn<{ members: { member: string }[]; threshold: number }>;
}

export default function ConfirmCreateMultisig({ createMultisigForm }: ConfirmCreateMultisigProps) {
  const { chain } = useChains();
  const { isValid, isSubmitting, isSubmitted } = useFormState(createMultisigForm);
  const { members, threshold } = createMultisigForm.getValues();

  const loading = isSubmitting || isSubmitted;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          onClick={(e) => {
            createMultisigForm.trigger();

            if (!isValid) {
              e.preventDefault();
            }
          }}
        >
          Submit
        </Button>
      </DialogTrigger>
      <DialogContent className={"overflow-y-auto bg-fuchsia-900"} style={{ width: "auto" }}>
        <DialogTitle>Create a new multisig on "{chain.chainDisplayName}"?</DialogTitle>
        <h4 className="font-bold">Members</h4>
        <div className="flex flex-col gap-2">
          {members
            .filter(({ member }) => member !== "")
            .map(({ member }) => (
              <div
                key={member}
                className="flex items-center space-x-2 rounded-md border p-2 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{member}</p>
                </div>
              </div>
            ))}
        </div>
        <div className="flex items-center gap-1 text-sm text-secondary">
          <Info className="text-secondary" />
          <p>
            {threshold} {threshold === 1 ? "signature" : "signatures"} needed to send a transaction.
          </p>
        </div>
        <div className="flex gap-4">
          <DialogClose asChild>
            <Button variant="secondary" className="mt-4" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="create-multisig-form" className="mt-4" disabled={loading}>
            {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create multisig
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
