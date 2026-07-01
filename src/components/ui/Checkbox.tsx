import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...props },
  ref,
) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-zinc-600">
      <input
        id={id}
        ref={ref}
        type="checkbox"
        className={cn("rounded border-zinc-300 text-gold-600 focus:ring-gold-500", className)}
        {...props}
      />
      {label}
    </label>
  );
});
