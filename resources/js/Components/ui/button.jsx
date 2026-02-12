import { cn } from "@/lib/utils";

const variants = {
    default: "bg-slate-700 text-white hover:bg-slate-600",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50",
    success: "bg-slate-700 text-white hover:bg-slate-600",
    info: "bg-slate-700 text-white hover:bg-slate-600",
    danger: "bg-slate-500 text-white hover:bg-slate-400",
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
                "inline-flex items-center justify-center rounded-lg font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed",
                variants[variant] || variants.default,
                sizes[size] || sizes.md,
                className,
            )}
            {...props}
        />
    );
}
