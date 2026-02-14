export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl border border-transparent bg-gradient-to-r from-rose-600 to-red-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[0_12px_26px_rgba(225,29,72,0.32)] transition duration-200 ease-out hover:from-rose-500 hover:to-red-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 active:scale-[0.98] ${
                    disabled && 'opacity-50 shadow-none'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
