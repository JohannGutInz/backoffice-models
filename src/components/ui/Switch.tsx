import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  "aria-label"?: string;
  size?: "sm" | "md";
};

const SIZE_CLASSES = {
  sm: { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" },
  md: { track: "h-6 w-11", thumb: "h-5 w-5", translate: "translate-x-5" },
};

export function Switch({ checked, onChange, disabled, size = "md", ...props }: SwitchProps) {
  const s = SIZE_CLASSES[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative shrink-0 rounded-full transition-colors disabled:opacity-40",
        s.track,
        checked ? "bg-zinc-950" : "bg-zinc-300",
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 rounded-full bg-white transition-transform",
          s.thumb,
          checked && s.translate,
        )}
      />
    </button>
  );
}
