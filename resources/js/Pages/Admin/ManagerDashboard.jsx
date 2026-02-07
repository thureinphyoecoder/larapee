import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";

export default function ManagerDashboard({ stats, recentOrders, dailySales = [], shop }) {
    return (
        <AdminLayout header="Manager Dashboard">
            <Head title="Manager Dashboard" />

            <div className="space-y-6">
                <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 text-white p-6 shadow">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                        Shop Manager
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                        {shop?.name || "Shop"} Operations Overview
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Shop Sales" value={`${stats?.shop_sales || 0} MMK`} />
                    <StatCard label="Total Orders" value={stats?.total_orders || 0} />
                    <StatCard label="Pending" value={stats?.pending_orders || 0} />
                    <StatCard label="Team Members" value={stats?.team_members || 0} />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Sales (Last 7 Days)</h3>
                    <div className="space-y-3">
                        {dailySales.map((d) => (
                            <div key={d.date} className="flex items-center gap-4">
                                <div className="w-24 text-xs text-slate-500">
                                    {new Date(d.date).toLocaleDateString()}
                                </div>
                                <div className="flex-1 h-2.5 bg-slate-100 rounded">
                                    <div
                                        className="h-2.5 bg-emerald-500 rounded"
                                        style={{ width: `${Math.min(100, Number(d.total) / 2000)}%` }}
                                    ></div>
                                </div>
                                <div className="w-28 text-right text-sm font-bold text-slate-700">
                                    {Number(d.total).toLocaleString()} MMK
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50">
                        <h3 className="font-bold text-slate-800">Recent Shop Orders</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-400 uppercase text-[11px] border-b border-slate-50">
                                    <th className="px-6 py-3">Order</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentOrders?.length ? (
                                    recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-3 font-bold text-slate-700">#{order.id}</td>
                                            <td className="px-6 py-3">{order.user?.name || "Unknown"}</td>
                                            <td className="px-6 py-3 font-semibold">
                                                {Number(order.total_amount).toLocaleString()} MMK
                                            </td>
                                            <td className="px-6 py-3 uppercase">{order.status}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-400">
                                            No orders yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-800">{value}</p>
        </div>
    );
}

