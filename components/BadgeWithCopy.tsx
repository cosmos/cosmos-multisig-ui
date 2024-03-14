import copy from "copy-to-clipboard";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

interface BadgeWithCopyProps {
  readonly name: string;
  readonly toCopy: string;
}

export default function BadgeWithCopy({ name, toCopy }: BadgeWithCopyProps) {
  return (
    <Badge
      onClick={async () => {
        copy(toCopy);
        toast(`Copied ${name} to clipboard`, { description: toCopy });
      }}
      className="max-w-md self-start truncate hover:cursor-pointer"
    >
      <Copy className="mr-2 h-auto w-3" />
      <span className="truncate">{toCopy}</span>
    </Badge>
  );
}
