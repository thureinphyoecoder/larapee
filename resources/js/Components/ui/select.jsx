import { cn } from "@/lib/utils";

export function Select({ className, ...props }) {
    return (
        <select
            className={cn(
                "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700",
                className,
            )}
            {...props}
        />
    );
}
