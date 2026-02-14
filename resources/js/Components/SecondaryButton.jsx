export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-xl border border-slate-300/90 bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition duration-200 ease-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800 ${
                    disabled && 'opacity-50'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
