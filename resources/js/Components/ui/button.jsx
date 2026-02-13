import { cn } from "@/lib/utils";

const variants = {
    default: "bg-slate-700 text-white hover:bg-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
    outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800",
    success: "bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500",
    info: "bg-sky-600 text-white hover:bg-sky-500 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500",
    danger: "bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-600 dark:text-white dark:hover:bg-rose-500",
};

const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
    icon: "h-9 w-9",
};

export function Button({ className, variant = "default", size = "md", ...props }) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-300",
                variants[variant] || variants.default,
                sizes[size] || sizes.md,
                className,
            )}
            {...props}
        />
    );
}
