import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ColorInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(function ColorInput(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="color"
      className={cn("h-10 w-12 cursor-pointer rounded-lg border border-zinc-300", className)}
      {...props}
    />
  );
});
