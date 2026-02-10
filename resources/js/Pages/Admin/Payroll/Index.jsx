import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function PayrollIndex({ month, rows = [], summary = {}, previewReleaseDate }) {
    const [period, setPeriod] = useState(month);

    const paidRate = useMemo(() => {
        const total = Number(summary.staff_count || 0);
        if (!total) return 0;
        return Math.round((Number(summary.paid_count || 0) / total) * 100);
    }, [summary]);

    return (
        <AdminLayout header="Payroll & HR">
            <Head title="Payroll" />

            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">HR Console</p>
                            <h1 className="mt-1 text-2xl font-black text-slate-900">Payroll + Attendance Settlement</h1>
                            <p className="mt-1 text-sm text-slate-500">Salary, bonus, increment, deduction and monthly payout tracking.</p>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.get(route("admin.payroll.index"), { month: period }, { preserveState: true, replace: true });
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="month"
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                            />
                            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Load</button>
                        </form>
                    </div>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Kpi label="Staff Count" value={summary.staff_count || 0} />
                        <Kpi label="Total Net Salary" value={`${Number(summary.total_net || 0).toLocaleString()} MMK`} tone="emerald" />
                        <Kpi label="Payout Done" value={`${summary.paid_count || 0} (${paidRate}%)`} tone="sky" />
                    </div>
                    <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                        Salary preview slips should be shared before payout date. Suggested preview date: {previewReleaseDate || "-"}.
                    </p>
                </section>

                <section className="space-y-4">
                    {rows.length ? (
                        rows.map((row) => <PayrollRow key={row.user_id} row={row} month={month} />)
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-400">No payroll staff found.</div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

function PayrollRow({ row, month }) {
    const profileForm = useForm({
        base_salary: row.payroll_profile?.base_salary || 0,
        allowance: row.payroll_profile?.allowance || 0,
        attendance_bonus_per_day: row.payroll_profile?.attendance_bonus_per_day || 0,
        absence_deduction_per_day: row.payroll_profile?.absence_deduction_per_day || 0,
        performance_bonus: row.payroll_profile?.performance_bonus || 0,
        overtime_rate_per_hour: row.payroll_profile?.overtime_rate_per_hour || 0,
        effective_from: `${month}-01`,
    });

    const adjustmentForm = useForm({
        type: "bonus",
        amount: "",
        reason: "",
        effective_date: `${month}-01`,
        is_recurring: false,
    });

    const payoutForm = useForm({
        period_month: month,
        gross_amount: row.totals?.gross || 0,
        deduction_amount: row.totals?.deduction || 0,
        net_amount: row.totals?.net || 0,
        note: "",
    });

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="font-black text-slate-900 text-lg">{row.name}</p>
                    <p className="text-sm text-slate-500">{row.role} {row.shop ? `• ${row.shop}` : ""}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Net Salary</p>
                    <p className="text-xl font-black text-slate-900">{Number(row.totals?.net || 0).toLocaleString()} MMK</p>
                    <p className={`text-xs font-semibold ${row.payout ? "text-emerald-700" : "text-amber-700"}`}>
                        {row.payout ? `Paid ${new Date(row.payout.paid_at).toLocaleString()}` : "Not paid yet"}
                    </p>
                </div>
            </div>

            <div className="p-5 grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Attendance</p>
                    <div className="mt-3 space-y-1.5 text-sm text-slate-700">
                        <p>Days: <b>{row.attendance?.days}</b> / {row.attendance?.expected_days}</p>
                        <p>Absence: <b>{row.attendance?.absence_days}</b></p>
                        <p>Worked: <b>{Math.floor((row.attendance?.worked_minutes || 0) / 60)}h {(row.attendance?.worked_minutes || 0) % 60}m</b></p>
                    </div>
                    <div className="mt-3 text-xs text-slate-600 space-y-1">
                        <p>Attendance bonus: {Number(row.totals?.attendance_bonus || 0).toLocaleString()} MMK</p>
                        <p>Performance bonus: {Number(row.totals?.performance_bonus || 0).toLocaleString()} MMK</p>
                        <p>Absence deduction: {Number(row.totals?.absence_deduction || 0).toLocaleString()} MMK</p>
                    </div>
                </div>

                <form
                    className="rounded-xl border border-slate-200 p-4 space-y-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        profileForm.post(route("admin.payroll.profile", row.user_id), { preserveScroll: true });
                    }}
                >
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Salary Template</p>
                    <Field label="Base Salary" value={profileForm.data.base_salary} onChange={(v) => profileForm.setData("base_salary", v)} />
                    <Field label="Allowance" value={profileForm.data.allowance} onChange={(v) => profileForm.setData("allowance", v)} />
                    <Field label="Attendance Bonus/Day" value={profileForm.data.attendance_bonus_per_day} onChange={(v) => profileForm.setData("attendance_bonus_per_day", v)} />
                    <Field label="Absence Deduction/Day" value={profileForm.data.absence_deduction_per_day} onChange={(v) => profileForm.setData("absence_deduction_per_day", v)} />
                    <Field label="Performance Bonus" value={profileForm.data.performance_bonus} onChange={(v) => profileForm.setData("performance_bonus", v)} />
                    <Field label="OT Rate / Hour" value={profileForm.data.overtime_rate_per_hour || 0} onChange={(v) => profileForm.setData("overtime_rate_per_hour", v)} />
                    <button className="w-full rounded-lg bg-slate-900 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={profileForm.processing}>
                        {profileForm.processing ? "Saving..." : "Save Template"}
                    </button>
                </form>

                <div className="space-y-3">
                    <form
                        className="rounded-xl border border-slate-200 p-4 space-y-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            adjustmentForm.post(route("admin.payroll.adjustments.store", row.user_id), { preserveScroll: true });
                        }}
                    >
                        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Adjustment</p>
                        <select
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            value={adjustmentForm.data.type}
                            onChange={(e) => adjustmentForm.setData("type", e.target.value)}
                        >
                            <option value="bonus">Bonus</option>
                            <option value="increment">Increment</option>
                            <option value="allowance">Allowance</option>
                            <option value="deduction">Deduction</option>
                        </select>
                        <input type="number" min="0.01" step="0.01" placeholder="Amount" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={adjustmentForm.data.amount} onChange={(e) => adjustmentForm.setData("amount", e.target.value)} required />
                        <input placeholder="Reason" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={adjustmentForm.data.reason} onChange={(e) => adjustmentForm.setData("reason", e.target.value)} required />
                        <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                            <input type="checkbox" checked={adjustmentForm.data.is_recurring} onChange={(e) => adjustmentForm.setData("is_recurring", e.target.checked)} />
                            Recurring monthly
                        </label>
                        <button className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={adjustmentForm.processing}>
                            {adjustmentForm.processing ? "Saving..." : "Add Adjustment"}
                        </button>
                    </form>

                    <form
                        className="rounded-xl border border-slate-200 p-4 space-y-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            payoutForm.post(route("admin.payroll.payout", row.user_id), { preserveScroll: true });
                        }}
                    >
                        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Payout</p>
                        <Field label="Gross" value={payoutForm.data.gross_amount} onChange={(v) => payoutForm.setData("gross_amount", v)} />
                        <Field label="Deduction" value={payoutForm.data.deduction_amount} onChange={(v) => payoutForm.setData("deduction_amount", v)} />
                        <Field label="Net" value={payoutForm.data.net_amount} onChange={(v) => payoutForm.setData("net_amount", v)} />
                        <input placeholder="Note (optional)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={payoutForm.data.note} onChange={(e) => payoutForm.setData("note", e.target.value)} />
                        <button className="w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={payoutForm.processing}>
                            {payoutForm.processing ? "Processing..." : "Mark as Paid"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="px-5 pb-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Salary Slip Preview</p>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <SlipItem label="Worked Days" value={`${row.slip?.worked_days || 0}/${row.slip?.expected_days || 0}`} />
                        <SlipItem label="OT Hours" value={row.slip?.overtime_hours || 0} />
                        <SlipItem label="Attendance Bonus" value={`${Number(row.totals?.attendance_bonus || 0).toLocaleString()} MMK`} />
                        <SlipItem label="OT + Bonus Total" value={`${Number(row.slip?.bonus_total || 0).toLocaleString()} MMK`} />
                        <SlipItem label="Deductions" value={`${Number(row.slip?.deduction_total || 0).toLocaleString()} MMK`} />
                        <SlipItem label="Net Salary" value={`${Number(row.slip?.net_salary || 0).toLocaleString()} MMK`} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange }) {
    return (
        <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
            <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
            />
        </label>
    );
}

function Kpi({ label, value, tone = "slate" }) {
    const tones = {
        slate: "border-slate-200 text-slate-900",
        emerald: "border-emerald-200 text-emerald-700",
        sky: "border-sky-200 text-sky-700",
    };

    return (
        <div className={`rounded-2xl border bg-white p-4 ${tones[tone] || tones.slate}`}>
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-black">{value}</p>
        </div>
    );
}

function SlipItem({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 font-semibold text-slate-800">{value}</p>
        </div>
    );
}
