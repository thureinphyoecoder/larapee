import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

const statusClasses = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-sky-100 text-sky-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
};

function money(value) {
    return `${Number(value || 0).toLocaleString()} MMK`;
}

export default function Dashboard({ orderCount = 0, recentOrders = [] }) {
    const { auth } = usePage().props;
    const userName = auth?.user?.name || "Customer";
    const [activeSlide, setActiveSlide] = useState(0);
    const [pauseSlider, setPauseSlider] = useState(false);

    const heroSlides = [
        {
            id: 1,
            label: "Today Highlight",
            title: "Fast shopping with clean checkout flow",
            subtitle:
                "Browse latest items, checkout in minutes, and track your order status from one place.",
            image: "/images/heroes/hero-tech.svg",
            accent: "from-orange-500 via-amber-500 to-yellow-400",
        },
        {
            id: 2,
            label: "Fresh Arrival",
            title: "Fashion, home and lifestyle deals",
            subtitle:
                "Curated selections from trusted shops with reliable delivery updates.",
            image: "/images/heroes/hero-fashion.svg",
            accent: "from-cyan-700 via-sky-600 to-emerald-500",
        },
        {
            id: 3,
            label: "Smart Picks",
            title: "Buy now and manage everything easily",
            subtitle:
                "Instant support chat, quick reorder, and secure order history for every purchase.",
            image: "/images/heroes/hero-lifestyle.svg",
            accent: "from-rose-700 via-red-600 to-orange-500",
        },
    ];

    useEffect(() => {
        if (pauseSlider || heroSlides.length <= 1) return;

        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [pauseSlider, heroSlides.length]);

    const currentSlide = heroSlides[activeSlide];

    const dashboardMetrics = useMemo(() => {
        const totals = recentOrders.reduce(
            (acc, order) => {
                const key = String(order.status || "pending").toLowerCase();
                acc[key] = (acc[key] || 0) + 1;
                acc.revenue += Number(order.total_amount || 0);
                return acc;
            },
            { revenue: 0 },
        );

        return {
            delivered: totals.delivered || 0,
            pending: (totals.pending || 0) + (totals.processing || 0),
            revenue: totals.revenue,
        };
    }, [recentOrders]);

    return (
        <AuthenticatedLayout>
            <Head title="Customer Dashboard" />

            <div
                className="min-h-screen bg-slate-100 py-8 sm:py-10"
                style={{ fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif' }}
            >
                <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-100 blur-2xl" />
                        <div className="absolute -bottom-16 left-1/3 h-52 w-52 rounded-full bg-sky-100 blur-2xl" />
                        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
                            <div>
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-slate-400">
                                    Customer Workspace
                                </p>
                                <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                                    Welcome, {userName}
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                                    Your shopping control center with quick access to products, orders, and support.
                                </p>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href={route("home")}
                                        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
                                    >
                                        Explore Store
                                    </Link>
                                    <Link
                                        href={route("orders.index")}
                                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400"
                                    >
                                        View Orders
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Orders</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{orderCount}</p>
                                </div>
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Delivered</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{dashboardMetrics.delivered}</p>
                                </div>
                                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Pending</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{dashboardMetrics.pending}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        onMouseEnter={() => setPauseSlider(true)}
                        onMouseLeave={() => setPauseSlider(false)}
                        className="group relative overflow-hidden rounded-3xl shadow-xl"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${currentSlide.image})` }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.accent} opacity-90`} />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_40%)]" />

                        <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-6 sm:min-h-[360px] sm:p-10">
                            <div className="max-w-2xl">
                                <span className="inline-flex rounded-full border border-white/60 bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white">
                                    {currentSlide.label}
                                </span>
                                <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">
                                    {currentSlide.title}
                                </h2>
                                <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                                    {currentSlide.subtitle}
                                </p>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href={route("home")}
                                    className="rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-slate-100"
                                >
                                    Shop Now
                                </Link>
                                <Link
                                    href={route("support.index")}
                                    className="rounded-2xl border border-white/70 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                                >
                                    Support Chat
                                </Link>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
                            }
                            className="absolute bottom-5 left-4 z-20 h-11 w-11 rounded-full border border-white/40 bg-white/90 text-lg font-black text-slate-700 shadow transition hover:bg-white sm:opacity-0 sm:pointer-events-none sm:group-hover:pointer-events-auto sm:group-hover:opacity-100"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
                            className="absolute bottom-5 right-4 z-20 h-11 w-11 rounded-full border border-white/40 bg-white/90 text-lg font-black text-slate-700 shadow transition hover:bg-white sm:opacity-0 sm:pointer-events-none sm:group-hover:pointer-events-auto sm:group-hover:opacity-100"
                        >
                            ›
                        </button>

                        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                            {heroSlides.map((slide, index) => (
                                <button
                                    key={slide.id}
                                    type="button"
                                    onClick={() => setActiveSlide(index)}
                                    className={`h-2.5 rounded-full transition ${
                                        index === activeSlide
                                            ? "w-8 bg-white"
                                            : "w-2.5 bg-white/60 hover:bg-white"
                                    }`}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            href={route("home")}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Shopping</p>
                            <p className="mt-2 text-lg font-black text-slate-900">Discover Products</p>
                            <span className="mt-2 inline-flex text-xs font-bold text-orange-600">Open store →</span>
                        </Link>
                        <Link
                            href={route("orders.index")}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Orders</p>
                            <p className="mt-2 text-lg font-black text-slate-900">Track and manage</p>
                            <span className="mt-2 inline-flex text-xs font-bold text-sky-600">Go to orders →</span>
                        </Link>
                        <Link
                            href={route("support.index")}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Support</p>
                            <p className="mt-2 text-lg font-black text-slate-900">Live help chat</p>
                            <span className="mt-2 inline-flex text-xs font-bold text-orange-600">Start chat →</span>
                        </Link>
                        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Recent Value</p>
                            <p className="mt-2 text-lg font-black">{money(dashboardMetrics.revenue)}</p>
                            <span className="mt-2 inline-flex text-xs font-bold text-slate-300">Last {recentOrders.length} orders</span>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 p-6">
                            <h3 className="text-lg font-black text-slate-900">Recent Orders</h3>
                            <Link href={route("orders.index")} className="text-xs font-bold text-orange-600">
                                View all
                            </Link>
                        </div>

                        <div className="space-y-3 p-4 sm:hidden">
                            {recentOrders.length ? (
                                recentOrders.map((order) => {
                                    const statusKey = String(order.status || "pending").toLowerCase();
                                    return (
                                        <Link
                                            key={order.id}
                                            href={route("orders.show", order.id)}
                                            className="block rounded-2xl border border-slate-100 bg-slate-50 p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-black text-slate-800">#{order.id}</span>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${
                                                        statusClasses[statusKey] || "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm font-bold text-slate-700">{money(order.total_amount)}</p>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="py-10 text-center text-slate-400">No orders yet.</div>
                            )}
                        </div>

                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-400">
                                        <th className="px-6 py-4 font-bold">Order ID</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold">Total</th>
                                        <th className="px-6 py-4 font-bold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentOrders.length ? (
                                        recentOrders.map((order) => {
                                            const statusKey = String(order.status || "pending").toLowerCase();
                                            return (
                                                <tr key={order.id} className="transition hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-black text-slate-800">#{order.id}</td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase ${
                                                                statusClasses[statusKey] || "bg-slate-100 text-slate-600"
                                                            }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-800">{money(order.total_amount)}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <Link
                                                            href={route("orders.show", order.id)}
                                                            className="font-bold text-orange-600 hover:underline"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="p-10 text-center text-slate-400">
                                                No orders yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
