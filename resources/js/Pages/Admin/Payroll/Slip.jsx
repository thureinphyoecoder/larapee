import { Head, Link } from "@inertiajs/react";

export default function PayrollSlip({ row, month, generatedAt }) {
    const printSlip = () => {
        window.print();
    };

    const money = (value) => `${Number(value || 0).toLocaleString()} MMK`;

    return (
        <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
            <Head title={`Salary Slip - ${row?.name || "Staff"}`} />

            <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-none print:shadow-none">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Payroll Receipt</p>
                        <h1 className="mt-1 text-3xl font-black text-slate-900">Salary Slip</h1>
                        <p className="mt-1 text-sm text-slate-500">Period: {row?.slip?.period || month}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                        <p>Generated: {generatedAt ? new Date(generatedAt).toLocaleString() : "-"}</p>
                        <p>Month Key: {month}</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
                    <Info label="Employee" value={row?.name || "-"} />
                    <Info label="Role" value={row?.role || "-"} />
                    <Info label="Shop" value={row?.shop || "-"} />
                    <Info label="Email" value={row?.email || "-"} />
                </div>

                <div className="mt-8 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                                <th className="border border-slate-200 px-3 py-2">Description</th>
                                <th className="border border-slate-200 px-3 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Line label="Base Salary" value={money(row?.totals?.base_salary)} />
                            <Line label="Allowance" value={money(row?.totals?.allowance)} />
                            <Line label="Attendance Bonus" value={money(row?.totals?.attendance_bonus)} />
                            <Line label="Performance Bonus" value={money(row?.totals?.performance_bonus)} />
                            <Line label={`Overtime Pay (${row?.attendance?.overtime_hours || 0} hrs)`} value={money(row?.totals?.overtime_pay)} />
                            <Line label="Manual Bonus / Increment" value={money(row?.totals?.manual_bonus)} />
                            <Line label="Absence Deduction" value={`- ${money(row?.totals?.absence_deduction)}`} />
                            <Line label="Manual Deduction" value={`- ${money(row?.totals?.manual_deduction)}`} />
                            <Line label="Gross" value={money(row?.totals?.gross)} bold />
                            <Line label="Total Deduction" value={money(row?.totals?.deduction)} bold />
                            <Line label="Net Salary" value={money(row?.totals?.net)} highlight />
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-3">
                    <Info label="Worked Days" value={`${row?.attendance?.days || 0}/${row?.attendance?.expected_days || 0}`} />
                    <Info label="Absence Days" value={row?.attendance?.absence_days || 0} />
                    <Info label="Worked Hours" value={`${Math.floor((row?.attendance?.worked_minutes || 0) / 60)}h ${(row?.attendance?.worked_minutes || 0) % 60}m`} />
                </div>

                <div className="mt-8 flex flex-wrap gap-3 print:hidden">
                    <button
                        onClick={printSlip}
                        className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800"
                    >
                        Print Salary Slip
                    </button>
                    <Link
                        href={route("admin.payroll.index", { month })}
                        className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        Back to Payroll
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 font-semibold text-slate-800">{value}</p>
        </div>
    );
}

function Line({ label, value, bold = false, highlight = false }) {
    return (
        <tr className={highlight ? "bg-emerald-50" : ""}>
            <td className={`border border-slate-200 px-3 py-2 ${bold || highlight ? "font-semibold text-slate-900" : "text-slate-700"}`}>{label}</td>
            <td className={`border border-slate-200 px-3 py-2 text-right ${highlight ? "font-black text-emerald-700" : bold ? "font-bold text-slate-900" : "text-slate-700"}`}>{value}</td>
        </tr>
    );
}
