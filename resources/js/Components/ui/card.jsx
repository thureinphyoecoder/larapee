import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
    return (
        <div
            className={cn(
                "rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_16px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70",
                className,
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }) {
    return <div className={cn("px-5 py-4 border-b border-slate-100/90 dark:border-slate-800", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
    return <h3 className={cn("text-base font-black tracking-tight text-slate-900 dark:text-slate-100", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
    return <p className={cn("text-xs text-slate-500 mt-1 dark:text-slate-400", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
    return <div className={cn("p-5", className)} {...props} />;
}
