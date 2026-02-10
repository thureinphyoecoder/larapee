import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";

const STAFF_BADGE = {
    admin: "bg-violet-100 text-violet-700",
    manager: "bg-sky-100 text-sky-700",
    sales: "bg-emerald-100 text-emerald-700",
    delivery: "bg-amber-100 text-amber-700",
    accountant: "bg-indigo-100 text-indigo-700",
    cashier: "bg-lime-100 text-lime-700",
    technician: "bg-orange-100 text-orange-700",
};

export default function UserDetail({
    record,
    isStaff,
    stats,
    attendances = [],
    recentOrders = [],
    selectedMonth,
    payrollPreview,
}) {
    const roleName = record?.roles?.[0]?.name || "customer";
    const roleTone = STAFF_BADGE[roleName] || "bg-slate-100 text-slate-700";
    const photoForm = useForm({ photo: null });

    return (
        <AdminLayout header="User Details">
            <Head title={`User - ${record?.name || "Details"}`} />

            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">Profile Record</p>
                            <h1 className="mt-1 text-2xl font-black text-slate-900">{record?.name}</h1>
                        </div>
                        <Link
                            href={route("admin.users.index")}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Back to Users
                        </Link>
                    </div>

                    <div className="p-6 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Identity</h2>
                            <div className="mt-4 flex items-center gap-4">
                                {record?.profile?.photo_path ? (
                                    <img
                                        src={`/storage/${record.profile.photo_path}`}
                                        alt={record?.name}
                                        className="h-16 w-16 rounded-full object-cover border border-slate-200"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full border border-slate-300 bg-white grid place-items-center text-xl font-black text-slate-500">
                                        {String(record?.name || "U").charAt(0)}
                                    </div>
                                )}
                                <form
                                    className="flex items-center gap-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        photoForm.post(route("admin.users.photo.update", record.id), {
                                            forceFormData: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="text-xs text-slate-600"
                                        onChange={(e) => photoForm.setData("photo", e.target.files?.[0] || null)}
                                    />
                                    <button
                                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                                        disabled={photoForm.processing}
                                    >
                                        Upload
                                    </button>
                                </form>
                            </div>
                            <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <Info label="Full Name" value={record?.name} />
                                <Info label="Email" value={record?.email} />
                                <Info label="Role" value={<span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${roleTone}`}>{roleName}</span>} />
                                <Info label="Assigned Shop" value={record?.shop?.name || "Not assigned"} />
                                <Info label="Phone" value={record?.profile?.phone_number || "-"} />
                                <Info label="NRC / National ID" value={record?.profile?.nrc_number || "-"} />
                                <Info label="City / State" value={[record?.profile?.city, record?.profile?.state].filter(Boolean).join(", ") || "-"} />
                            </dl>
                            <div className="mt-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Address</p>
                                <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                                    {record?.profile?.address_line_1 || "No address recorded."}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {isStaff ? (
                                <>
                                    <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                                        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Payroll Preview Month</p>
                                        <form
                                            className="mt-2 flex items-center gap-2"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const monthEl = e.currentTarget.querySelector("input[type='month']");
                                                const month = monthEl?.value || selectedMonth;
                                                router.get(route("admin.users.show", record.id), { month }, { preserveState: true, replace: true });
                                            }}
                                        >
                                            <input
                                                type="month"
                                                defaultValue={selectedMonth || new Date().toISOString().slice(0, 7)}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                            />
                                            <button className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Load</button>
                                        </form>
                                    </div>
                                    <Stat title="Worked Days" value={`${payrollPreview?.attendance?.days || 0}/${payrollPreview?.attendance?.expected_days || 0}`} />
                                    <Stat title="OT Hours" value={payrollPreview?.attendance?.overtime_hours || 0} />
                                    <Stat title="Estimated Net Salary" value={`${Number(payrollPreview?.totals?.net || 0).toLocaleString()} MMK`} />
                                </>
                            ) : (
                                <>
                                    <Stat title="Total Orders" value={stats?.order_count || 0} />
                                    <Stat title="Total Spent" value={`${Number(stats?.total_spent || 0).toLocaleString()} MMK`} />
                                    <Stat title="Attendance Records" value={stats?.attendance_days || 0} />
                                </>
                            )}
                            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Record Type</p>
                                <p className="mt-2 text-sm font-semibold text-slate-700">
                                    {isStaff ? "Staff Profile" : "Customer Profile"}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="font-black text-slate-900">Attendance Timeline</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {attendances.length ? (
                                attendances.map((row) => (
                                    <div key={row.id} className="px-5 py-3">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {new Date(row.check_in_at).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Checkout: {row.check_out_at ? new Date(row.check_out_at).toLocaleString() : "Still active"}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">Worked: {Math.floor((row.worked_minutes || 0) / 60)}h {(row.worked_minutes || 0) % 60}m</p>
                                    </div>
                                ))
                            ) : (
                                <p className="px-5 py-10 text-sm text-slate-400">No attendance record yet.</p>
                            )}
                        </div>
                    </div>

                    {isStaff ? (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <h3 className="font-black text-slate-900">Salary Slip Preview</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    OT / attendance / bonus / deduction breakdown for {selectedMonth}.
                                </p>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <SlipItem label="Base Salary" value={`${Number(payrollPreview?.totals?.base_salary || 0).toLocaleString()} MMK`} />
                                <SlipItem label="Allowance" value={`${Number(payrollPreview?.totals?.allowance || 0).toLocaleString()} MMK`} />
                                <SlipItem label="Attendance Bonus" value={`${Number(payrollPreview?.totals?.attendance_bonus || 0).toLocaleString()} MMK`} />
                                <SlipItem label="Performance Bonus" value={`${Number(payrollPreview?.totals?.performance_bonus || 0).toLocaleString()} MMK`} />
                                <SlipItem label="OT Hours" value={payrollPreview?.attendance?.overtime_hours || 0} />
                                <SlipItem label="OT Pay" value={`${Number(payrollPreview?.totals?.overtime_pay || 0).toLocaleString()} MMK`} />
                                <SlipItem label="Manual Bonus/Increment" value={`${Number(payrollPreview?.totals?.manual_bonus || 0).toLocaleString()} MMK`} />
                                <SlipItem label="Absence Deduction" value={`${Number(payrollPreview?.totals?.absence_deduction || 0).toLocaleString()} MMK`} />
                                <SlipItem label="Manual Deduction" value={`${Number(payrollPreview?.totals?.manual_deduction || 0).toLocaleString()} MMK`} />
                                <SlipItem label="Gross" value={`${Number(payrollPreview?.totals?.gross || 0).toLocaleString()} MMK`} />
                                <SlipItem label="Total Deduction" value={`${Number(payrollPreview?.totals?.deduction || 0).toLocaleString()} MMK`} />
                                <SlipItem label="Net Salary" value={`${Number(payrollPreview?.totals?.net || 0).toLocaleString()} MMK`} highlight />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <h3 className="font-black text-slate-900">Recent Orders</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-400 uppercase text-[11px] border-b border-slate-100">
                                            <th className="px-5 py-3">Invoice</th>
                                            <th className="px-5 py-3">Shop</th>
                                            <th className="px-5 py-3">Amount</th>
                                            <th className="px-5 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentOrders.length ? (
                                            recentOrders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="px-5 py-3 font-semibold text-slate-700">{order.invoice_no || `#${order.id}`}</td>
                                                    <td className="px-5 py-3">{order.shop?.name || "-"}</td>
                                                    <td className="px-5 py-3">{Number(order.total_amount || 0).toLocaleString()} MMK</td>
                                                    <td className="px-5 py-3 uppercase text-xs font-bold">{order.status}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-5 py-10 text-center text-slate-400">
                                                    No order history.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500 font-bold">{label}</dt>
            <dd className="mt-1 text-sm text-slate-800 font-medium">{value || "-"}</dd>
        </div>
    );
}

function Stat({ title, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 p-4 bg-white">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">{title}</p>
            <p className="mt-2 text-xl font-black text-slate-900">{value}</p>
        </div>
    );
}

function SlipItem({ label, value, highlight = false }) {
    return (
        <div className={`rounded-lg border px-3 py-2 ${highlight ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className={`mt-1 font-semibold ${highlight ? "text-emerald-700" : "text-slate-800"}`}>{value}</p>
        </div>
    );
}
