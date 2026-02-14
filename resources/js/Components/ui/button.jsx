import { cn } from "@/lib/utils";

const variants = {
    default:
        "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-[0_10px_26px_rgba(249,115,22,0.34)] hover:from-orange-400 hover:to-orange-500",
    secondary:
        "border border-slate-300/80 bg-white/95 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800/90",
    outline:
        "border border-slate-300/80 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800/70",
    success:
        "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_22px_rgba(16,185,129,0.3)] hover:from-emerald-400 hover:to-teal-400",
    info:
        "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-[0_10px_24px_rgba(14,165,233,0.3)] hover:from-cyan-400 hover:to-sky-400",
    danger:
        "bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-[0_10px_24px_rgba(225,29,72,0.3)] hover:from-rose-500 hover:to-red-400",
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
                "inline-flex items-center justify-center rounded-xl font-semibold transition duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:focus-visible:ring-cyan-400/60 dark:focus-visible:ring-offset-slate-950",
                variants[variant] || variants.default,
                sizes[size] || sizes.md,
                className,
            )}
            {...props}
        />
    );
}
