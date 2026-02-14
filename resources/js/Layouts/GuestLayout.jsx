import ApplicationLogo from '@/Components/ApplicationLogo';
import LocaleSwitcher from '@/Components/LocaleSwitcher';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="premium-shell relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
            <div className="absolute right-5 top-5 z-20">
                <LocaleSwitcher />
            </div>

            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_15%_20%,rgba(249,115,22,0.2),transparent_40%),radial-gradient(circle_at_88%_14%,rgba(14,165,233,0.16),transparent_36%),linear-gradient(170deg,rgba(255,255,255,0.9),rgba(241,245,252,0.95))] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(249,115,22,0.15),transparent_45%),radial-gradient(circle_at_88%_14%,rgba(14,165,233,0.16),transparent_38%),linear-gradient(170deg,rgba(2,6,23,0.92),rgba(7,11,24,0.97))]" />

            <div className="relative z-10">
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-orange-500 drop-shadow-[0_10px_28px_rgba(249,115,22,0.28)]" />
                </Link>
            </div>

            <div className="premium-card relative z-10 mt-7 w-full overflow-hidden px-6 py-5 sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
