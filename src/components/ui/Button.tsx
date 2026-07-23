import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:brightness-105 disabled:opacity-40",
  secondary: "bg-card border border-card-border text-foreground hover:border-accent/60 disabled:opacity-40",
  ghost: "text-muted hover:text-foreground disabled:opacity-40",
  danger: "text-priority-high hover:bg-priority-high/10 disabled:opacity-40",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98] disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
