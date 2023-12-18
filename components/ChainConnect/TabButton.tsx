import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import { TabsTrigger } from "../ui/tabs";

export default function TabButton({
  value,
  children,
  className,
  ...restProps
}: ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "border-2 border-solid border-white bg-transparent text-white data-[state=active]:bg-white data-[state=active]:text-gray-900",
        className,
      )}
      {...restProps}
    >
      {children}
    </TabsTrigger>
  );
}
