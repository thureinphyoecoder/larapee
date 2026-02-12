import { cn } from "@/lib/utils";

const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    info: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
};

export function Badge({ className, variant = "default", ...props }) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                variants[variant] || variants.default,
                className,
            )}
            {...props}
        />
    );
}
