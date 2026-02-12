import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function PayrollIndex({ month, rows = [], summary = {}, previewReleaseDate }) {
    const [period, setPeriod] = useState(month);

    const paidRate = useMemo(() => {
        const total = numberValue(summary.staff_count);
        if (!total) return 0;
        return Math.round((numberValue(summary.paid_count) / total) * 100);
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
                            <p className="mt-1 text-sm text-slate-500">Salary template, adjustments and payout are moved into action modals per staff.</p>
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
                        <Kpi label="Staff Count" value={numberValue(summary.staff_count)} />
                        <Kpi label="Total Net Salary" value={formatMMK(summary.total_net)} tone="emerald" />
                        <Kpi label="Payout Done" value={`${numberValue(summary.paid_count)} (${paidRate}%)`} tone="sky" />
                    </div>

                    <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                        Salary preview slips should be shared before payout date. Suggested preview date: {previewReleaseDate || "-"}.
                    </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {rows.length ? (
                        <PayrollTable rows={rows} month={month} />
                    ) : (
                        <div className="p-10 text-center text-slate-400">No payroll staff found.</div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

function PayrollTable({ rows, month }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 text-left font-bold">Staff</th>
                        <th className="px-4 py-3 text-left font-bold">Attendance</th>
                        <th className="px-4 py-3 text-left font-bold">Breakdown</th>
                        <th className="px-4 py-3 text-right font-bold">Net Salary</th>
                        <th className="px-4 py-3 text-left font-bold">Status</th>
                        <th className="px-4 py-3 text-right font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <PayrollTableRow key={row.user_id} row={row} month={month} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PayrollTableRow({ row, month }) {
    const [activeModal, setActiveModal] = useState(null);

    const attendance = row.attendance || {};
    const totals = row.totals || {};
    const paid = Boolean(row.payout);

    return (
        <>
            <tr className="border-t border-slate-100 align-top">
                <td className="px-4 py-4">
                    <p className="font-bold text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.role} {row.shop ? `• ${row.shop}` : ""}</p>
                </td>
                <td className="px-4 py-4 text-xs text-slate-700">
                    <p>Days: <b>{numberValue(attendance.days)}</b> / {numberValue(attendance.expected_days)}</p>
                    <p>Absence: <b>{numberValue(attendance.absence_days)}</b></p>
                    <p>Worked: <b>{formatWorkedMinutes(attendance.worked_minutes)}</b></p>
                </td>
                <td className="px-4 py-4 text-xs text-slate-700 space-y-1">
                    <p>Bonus: <b>{formatMMK(totals.attendance_bonus)}</b></p>
                    <p>Performance: <b>{formatMMK(totals.performance_bonus)}</b></p>
                    <p>Deduction: <b>{formatMMK(totals.absence_deduction)}</b></p>
                </td>
                <td className="px-4 py-4 text-right">
                    <p className="text-base font-black text-slate-900">{formatMMK(totals.net)}</p>
                </td>
                <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {paid ? "Paid" : "Pending"}
                    </span>
                    {paid && (
                        <p className="mt-1 text-[11px] text-slate-500">
                            {new Date(row.payout.paid_at).toLocaleString()}
                        </p>
                    )}
                </td>
                <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                        <Link
                            href={route("admin.payroll.slip", { user: row.user_id, month })}
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Slip
                        </Link>
                        <button type="button" className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-white" onClick={() => setActiveModal("profile")}>Template</button>
                        <button type="button" className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white" onClick={() => setActiveModal("adjustment")}>Adjustment</button>
                        <button type="button" className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white" onClick={() => setActiveModal("payout")}>Payout</button>
                    </div>
                </td>
            </tr>

            <ProfileModal row={row} month={month} open={activeModal === "profile"} onClose={() => setActiveModal(null)} />
            <AdjustmentModal row={row} month={month} open={activeModal === "adjustment"} onClose={() => setActiveModal(null)} />
            <PayoutModal row={row} month={month} open={activeModal === "payout"} onClose={() => setActiveModal(null)} />
        </>
    );
}

function ProfileModal({ row, month, open, onClose }) {
    const form = useForm({
        base_salary: row.payroll_profile?.base_salary || 0,
        allowance: row.payroll_profile?.allowance || 0,
        attendance_bonus_per_day: row.payroll_profile?.attendance_bonus_per_day || 0,
        absence_deduction_per_day: row.payroll_profile?.absence_deduction_per_day || 0,
        performance_bonus: row.payroll_profile?.performance_bonus || 0,
        overtime_rate_per_hour: row.payroll_profile?.overtime_rate_per_hour || 0,
        effective_from: `${month}-01`,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route("admin.payroll.profile", row.user_id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title={`Salary Template • ${row.name}`}>
            <form className="space-y-3" onSubmit={submit}>
                <Field label="Base Salary" value={form.data.base_salary} onChange={(v) => form.setData("base_salary", v)} />
                <Field label="Allowance" value={form.data.allowance} onChange={(v) => form.setData("allowance", v)} />
                <Field label="Attendance Bonus/Day" value={form.data.attendance_bonus_per_day} onChange={(v) => form.setData("attendance_bonus_per_day", v)} />
                <Field label="Absence Deduction/Day" value={form.data.absence_deduction_per_day} onChange={(v) => form.setData("absence_deduction_per_day", v)} />
                <Field label="Performance Bonus" value={form.data.performance_bonus} onChange={(v) => form.setData("performance_bonus", v)} />
                <Field label="OT Rate / Hour" value={form.data.overtime_rate_per_hour} onChange={(v) => form.setData("overtime_rate_per_hour", v)} />
                <ModalActions processing={form.processing} submitLabel="Save Template" />
            </form>
        </Modal>
    );
}

function AdjustmentModal({ row, month, open, onClose }) {
    const form = useForm({
        type: "bonus",
        amount: "",
        reason: "",
        effective_date: `${month}-01`,
        is_recurring: false,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route("admin.payroll.adjustments.store", row.user_id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title={`Adjustment • ${row.name}`}>
            <form className="space-y-3" onSubmit={submit}>
                <label className="block">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">Type</span>
                    <select
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={form.data.type}
                        onChange={(e) => form.setData("type", e.target.value)}
                    >
                        <option value="bonus">Bonus</option>
                        <option value="increment">Increment</option>
                        <option value="allowance">Allowance</option>
                        <option value="deduction">Deduction</option>
                    </select>
                </label>
                <label className="block">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">Amount</span>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={form.data.amount}
                        onChange={(e) => form.setData("amount", e.target.value)}
                        required
                    />
                </label>
                <label className="block">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">Reason</span>
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={form.data.reason}
                        onChange={(e) => form.setData("reason", e.target.value)}
                        required
                    />
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" checked={form.data.is_recurring} onChange={(e) => form.setData("is_recurring", e.target.checked)} />
                    Recurring monthly
                </label>
                <ModalActions processing={form.processing} submitLabel="Add Adjustment" submitTone="indigo" />
            </form>
        </Modal>
    );
}

function PayoutModal({ row, month, open, onClose }) {
    const form = useForm({
        period_month: month,
        gross_amount: row.totals?.gross || 0,
        deduction_amount: row.totals?.deduction || 0,
        net_amount: row.totals?.net || 0,
        note: "",
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route("admin.payroll.payout", row.user_id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title={`Payout • ${row.name}`}>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <SlipItem label="Worked Days" value={`${numberValue(row.slip?.worked_days)}/${numberValue(row.slip?.expected_days)}`} />
                <SlipItem label="OT Hours" value={numberValue(row.slip?.overtime_hours)} />
                <SlipItem label="Bonus Total" value={formatMMK(row.slip?.bonus_total)} />
                <SlipItem label="Deduction Total" value={formatMMK(row.slip?.deduction_total)} />
            </div>
            <form className="space-y-3" onSubmit={submit}>
                <Field label="Gross" value={form.data.gross_amount} onChange={(v) => form.setData("gross_amount", v)} />
                <Field label="Deduction" value={form.data.deduction_amount} onChange={(v) => form.setData("deduction_amount", v)} />
                <Field label="Net" value={form.data.net_amount} onChange={(v) => form.setData("net_amount", v)} />
                <label className="block">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">Note</span>
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={form.data.note}
                        onChange={(e) => form.setData("note", e.target.value)}
                        placeholder="optional"
                    />
                </label>
                <ModalActions processing={form.processing} submitLabel="Mark as Paid" submitTone="emerald" />
            </form>
        </Modal>
    );
}

function Modal({ open, onClose, title, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <button type="button" className="absolute inset-0 bg-slate-950/45" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <p className="text-base font-black text-slate-900">{title}</p>
                    <button type="button" className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100" onClick={onClose}>
                        Close
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ModalActions({ processing, submitLabel, submitTone = "slate" }) {
    const tones = {
        slate: "bg-slate-900",
        indigo: "bg-indigo-600",
        emerald: "bg-emerald-600",
    };

    return (
        <div className="pt-1">
            <button className={`w-full rounded-lg py-2 text-xs font-bold text-white disabled:opacity-60 ${tones[submitTone] || tones.slate}`} disabled={processing}>
                {processing ? "Saving..." : submitLabel}
            </button>
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
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 font-semibold text-slate-800">{value}</p>
        </div>
    );
}

function numberValue(value) {
    return Number(value || 0);
}

function formatMMK(value) {
    return `${numberValue(value).toLocaleString()} MMK`;
}

function formatWorkedMinutes(minutes) {
    const total = numberValue(minutes);
    const hours = Math.floor(total / 60);
    const remain = total % 60;
    return `${hours}h ${remain}m`;
}
