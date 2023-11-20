import { cn } from "@/lib/utils";
import { ComponentProps, MouseEventHandler, useEffect, useState } from "react";
import { Button } from "../ui/button";

interface ButtonWithConfirmProps extends Omit<ComponentProps<typeof Button>, "children"> {
  readonly text: string;
  readonly confirmText: string;
  readonly onClick: MouseEventHandler<HTMLButtonElement>;
}

export default function ButtonWithConfirm({
  text,
  confirmText,
  onClick,
  ...restProps
}: ButtonWithConfirmProps) {
  const [toConfirm, setToConfirm] = useState(false);

  useEffect(() => {
    if (!toConfirm) {
      return;
    }

    const timeout = setTimeout(() => {
      setToConfirm(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [toConfirm]);

  return (
    <Button
      size="sm"
      variant={toConfirm ? "destructive" : "default"}
      className={cn(toConfirm ? "" : "bg-yellow-300 hover:bg-yellow-300")}
      onClick={
        toConfirm
          ? onClick
          : () => {
              setToConfirm(true);
            }
      }
      {...restProps}
    >
      {toConfirm ? confirmText : text}
    </Button>
  );
}
