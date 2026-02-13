import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

const STATUS_TONE = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    confirmed: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    refunded: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    returned: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
};

export default function Index({ orders }) {
    const rows = orders?.data || orders || [];

    return (
        <AdminLayout header="Orders">
            <Head title="Admin Orders" />

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <div className="border-b border-slate-50 p-6 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Orders</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 text-[11px] uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                <th className="px-6 py-4 font-bold">Order ID</th>
                                <th className="px-6 py-4 font-bold">Customer</th>
                                <th className="px-6 py-4 font-bold">Shop</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {rows.length > 0 ? (
                                rows.map((order) => {
                                    const statusKey = String(order.status || "pending").toLowerCase();
                                    const tone = STATUS_TONE[statusKey] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
                                    return (
                                        <tr key={order.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                                #{order.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {order.user?.name || "Customer not set"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {order.shop?.name || "Shop not assigned"}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                                                {order.total_amount} MMK
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase ${tone}`}>
                                                    {order.status || "pending"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={route("admin.orders.show", order.id)}
                                                    className="text-orange-600 font-semibold text-sm hover:underline"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="p-12 text-center italic text-slate-400 dark:text-slate-500"
                                    >
                                        No orders yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
