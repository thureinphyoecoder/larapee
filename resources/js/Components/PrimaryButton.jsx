export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl border border-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[0_12px_28px_rgba(249,115,22,0.35)] transition duration-200 ease-out hover:from-orange-400 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 active:scale-[0.98] ${
                    disabled && 'opacity-50 shadow-none'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
