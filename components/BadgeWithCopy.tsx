import copy from "copy-to-clipboard";
import { Copy } from "lucide-react";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";

interface BadgeWithCopyProps {
  readonly name: string;
  readonly toCopy: string;
}

export default function BadgeWithCopy({ name, toCopy }: BadgeWithCopyProps) {
  const { toast } = useToast();

  return (
    <Badge
      onClick={() => {
        copy(toCopy);
        toast({ description: `Copied ${name} to clipboard` });
      }}
      className="max-w-md self-start truncate hover:cursor-pointer"
    >
      <Copy className="mr-2 h-auto w-3" />
      <span className="truncate">{toCopy}</span>
    </Badge>
  );
}
