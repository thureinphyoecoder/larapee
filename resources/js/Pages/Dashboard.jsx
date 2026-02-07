// resources/js/Pages/Dashboard.jsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Dashboard({ orderCount = 0, recentOrders = [] }) {
    const { auth } = usePage().props;
    const userName = auth?.user?.name || "Customer";

    return (
        <AuthenticatedLayout>
            <Head title="Customer Dashboard" />
            <div className="py-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 text-white shadow-lg">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                            Customer Space
                        </p>
                        <h2 className="mt-2 text-2xl sm:text-3xl font-black">
                            Welcome back, {userName}
                        </h2>
                        <p className="mt-3 text-sm text-white/90">
                            Your account summary and latest orders are ready.
                        </p>
                    </div>

                    <Link
                        href={route("home")}
                        className="block rounded-3xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-white p-6 sm:p-8 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">
                                    Shop Now
                                </p>
                                <h3 className="mt-2 text-2xl sm:text-4xl font-black text-slate-900">
                                    ပစ္စည်းအသစ်တွေ ဝယ်ယူရန် ဒီကိုနှိပ်ပါ
                                </h3>
                                <p className="mt-2 text-sm sm:text-base text-slate-600">
                                    Popular products ကို ချက်ချင်းကြည့်ပြီး cart ထဲထည့်နိုင်ပါတယ်။
                                </p>
                            </div>
                            <div className="inline-flex items-center justify-center rounded-2xl bg-orange-600 text-white px-6 py-4 text-lg font-black shadow">
                                ဈေးဝယ်ရန် သွားမယ် →
                            </div>
                        </div>
                    </Link>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <p className="text-xs uppercase tracking-widest text-slate-400">
                                Total Orders
                            </p>
                            <p className="mt-2 text-3xl font-black text-orange-600">
                                {orderCount}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                All time
                            </p>
                        </div>
                        <Link
                            href={route("support.index")}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition"
                        >
                            <p className="text-xs uppercase tracking-widest text-slate-400">
                                Support
                            </p>
                            <p className="mt-2 font-semibold text-slate-800">
                                Need help from manager?
                            </p>
                            <span className="mt-3 inline-flex text-xs font-bold text-orange-600">
                                Open support chat →
                            </span>
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">
                                Recent Orders
                            </h3>
                            <Link
                                href={route("orders.index")}
                                className="text-xs font-bold text-orange-600"
                            >
                                View all
                            </Link>
                        </div>

                        {/* Mobile cards */}
                        <div className="p-4 space-y-3 sm:hidden">
                            {recentOrders.length ? (
                                recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={route("orders.show", order.id)}
                                        className="block bg-slate-50 rounded-2xl p-4 border border-slate-100"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-700">
                                                #{order.id}
                                            </span>
                                            <span className="text-[10px] uppercase font-black text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {Number(
                                                order.total_amount,
                                            ).toLocaleString()}{" "}
                                            MMK
                                        </p>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 py-8">
                                    No orders yet.
                                </div>
                            )}
                        </div>

                        {/* Desktop table */}
                        <div className="overflow-x-auto hidden sm:block">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-50">
                                        <th className="px-6 py-4 font-bold">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-4 font-bold">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 font-bold">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 font-bold">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentOrders.length ? (
                                        recentOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4 font-semibold">
                                                    #{order.id}
                                                </td>
                                                <td className="px-6 py-4 uppercase text-sm text-slate-600">
                                                    {order.status}
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    {Number(
                                                        order.total_amount,
                                                    ).toLocaleString()}{" "}
                                                    MMK
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Link
                                                        href={route(
                                                            "orders.show",
                                                            order.id,
                                                        )}
                                                        className="text-orange-600 font-semibold hover:underline"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="p-8 text-center text-slate-400"
                                            >
                                                No orders yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
