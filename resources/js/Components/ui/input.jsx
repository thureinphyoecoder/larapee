import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "premium-input h-10 w-full rounded-xl px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500",
                className,
            )}
            {...props}
        />
    );
}
