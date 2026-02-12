import { cn } from "@/lib/utils";

export function Table({ className, ...props }) {
    return <table className={cn("w-full text-sm", className)} {...props} />;
}

export function TableHeader({ className, ...props }) {
    return <thead className={cn("bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
    return <tbody className={cn("divide-y divide-slate-100 dark:divide-slate-800", className)} {...props} />;
}

export function TableRow({ className, ...props }) {
    return <tr className={cn("hover:bg-slate-50/70 transition dark:hover:bg-slate-800/50", className)} {...props} />;
}

export function TableHead({ className, ...props }) {
    return <th className={cn("px-4 py-3 text-left text-xs font-bold uppercase tracking-wider", className)} {...props} />;
}

export function TableCell({ className, ...props }) {
    return <td className={cn("px-4 py-3 align-top", className)} {...props} />;
}
