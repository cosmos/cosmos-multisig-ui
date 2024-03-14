import { clsx, type ClassValue } from "clsx";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToastErrorProps {
  readonly title?: string;
  readonly description?: string;
  readonly fullError?: Error;
}

export function toastError(
  { title, description, fullError }: ToastErrorProps = { title: "An error ocurred" },
) {
  toast.error(title, {
    description,
    action:
      fullError && fullError.message
        ? { label: "Copy full error", onClick: () => copy(fullError.message) }
        : undefined,
    classNames: {
      closeButton:
        "group-[.toaster]:!bg-destructive group-[.toaster]:!text-destructive-foreground [&>svg]:!stroke-[4px]",
    },
    actionButtonStyle: {
      backgroundColor: "hsl(var(--destructive-foreground))",
      color: "hsl(var(--destructive))",
      fontWeight: "bold",
    },
  });
}

export function toastSuccess(title: string, description?: string) {
  toast.success(title, {
    description,
    classNames: {
      closeButton:
        "group-[.toaster]:!bg-green-500 group-[.toaster]:!text-white [&>svg]:!stroke-[4px]",
    },
  });
}
