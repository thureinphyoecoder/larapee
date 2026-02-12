import AdminLayout from "@/Layouts/AdminLayout";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function PayrollIndex({ month, rows = { data: [] }, summary = {}, filters = {}, previewReleaseDate }) {
    const [period, setPeriod] = useState(month);
    const [search, setSearch] = useState(filters?.q || "");
    const [perPage, setPerPage] = useState(String(filters?.per_page || rows?.per_page || 25));
    const staffRows = rows?.data || [];
    const paidRate = useMemo(() => {
        const total = numberValue(summary.page_staff_count || summary.staff_count);
        if (!total) return 0;
        return Math.round((numberValue(summary.paid_count) / total) * 100);
    }, [summary]);

    const reload = (next = {}) => {
        router.get(
            route("admin.payroll.index"),
            {
                month: next.month ?? period,
                q: (next.q ?? search) || undefined,
                per_page: next.per_page ?? perPage,
                page: next.page,
            },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    return (
        <AdminLayout header="Payroll & HR">
            <Head title="Payroll" />
            <div className="space-y-6">
                <Card className="rounded-3xl">
                    <CardContent className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold dark:text-slate-500">HR Console</p>
                                <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">Payroll Settlement</h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Modern table + action dialogs for fast manager workflow.</p>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    reload({ month: period, page: 1 });
                                }}
                                className="flex flex-wrap items-center gap-2"
                            >
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search staff by name or email"
                                    className="w-64"
                                />
                                <Select
                                    value={perPage}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPerPage(value);
                                        reload({ per_page: value, page: 1 });
                                    }}
                                    className="w-24"
                                >
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </Select>
                                <Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
                                <Button size="md" className="bg-orange-600 hover:bg-orange-500 text-white dark:bg-orange-500 dark:text-white dark:hover:bg-orange-400">Load</Button>
                            </form>
                        </div>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Kpi label="Staff Count" value={numberValue(summary.staff_count)} />
                            <Kpi label="Page Net Salary" value={formatMMK(summary.total_net)} tone="orange" />
                            <Kpi label="Page Payout Done" value={`${numberValue(summary.paid_count)} (${paidRate}%)`} tone="amber" />
                        </div>
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Suggested slip preview date: {previewReleaseDate || "-"}.
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    {staffRows.length ? (
                        <PayrollTable rows={staffRows} month={month} />
                    ) : (
                        <CardContent className="py-12 text-center text-slate-400 dark:text-slate-500">No payroll staff found.</CardContent>
                    )}
                    <Pagination rows={rows} onChange={(page) => reload({ page })} />
                </Card>
            </div>
        </AdminLayout>
    );
}

function PayrollTable({ rows, month }) {
    return (
        <div className="overflow-x-auto">
            <Table className="min-w-[980px]">
                <TableHeader>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableHead>Staff</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Breakdown</TableHead>
                        <TableHead className="text-right">Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <PayrollTableRow key={row.user_id} row={row} month={month} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function PayrollTableRow({ row, month }) {
    const [activeDialog, setActiveDialog] = useState(null);
    const attendance = row.attendance || {};
    const totals = row.totals || {};
    const paid = Boolean(row.payout);

    return (
        <>
            <TableRow className="align-top">
                <TableCell>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{row.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.role} {row.shop ? `• ${row.shop}` : ""}</p>
                </TableCell>
                <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                    <p>Days: <b>{numberValue(attendance.days)}</b> / {numberValue(attendance.expected_days)}</p>
                    <p>Absence: <b>{numberValue(attendance.absence_days)}</b></p>
                    <p>Worked: <b>{formatWorkedMinutes(attendance.worked_minutes)}</b></p>
                </TableCell>
                <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                    <p>Bonus: <b>{formatMMK(totals.attendance_bonus)}</b></p>
                    <p>Performance: <b>{formatMMK(totals.performance_bonus)}</b></p>
                    <p>Deduction: <b>{formatMMK(totals.absence_deduction)}</b></p>
                </TableCell>
                <TableCell className="text-right font-black text-slate-900 dark:text-slate-100">{formatMMK(totals.net)}</TableCell>
                <TableCell>
                    <Badge variant={paid ? "success" : "warning"}>{paid ? "Paid" : "Pending"}</Badge>
                    {paid && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{new Date(row.payout.paid_at).toLocaleString()}</p>}
                </TableCell>
                <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Link
                            href={route("admin.payroll.slip", { user: row.user_id, month })}
                            className="inline-flex h-8 items-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Slip
                        </Link>
                        <Button size="sm" variant="secondary" className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" onClick={() => setActiveDialog("profile")}>Template</Button>
                        <Button size="sm" variant="outline" className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => setActiveDialog("adjustment")}>Adjustment</Button>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-white dark:bg-orange-500 dark:text-white dark:hover:bg-orange-400" onClick={() => setActiveDialog("payout")}>Payout</Button>
                    </div>
                </TableCell>
            </TableRow>

            <ProfileDialog row={row} month={month} open={activeDialog === "profile"} onOpenChange={(open) => setActiveDialog(open ? "profile" : null)} />
            <AdjustmentDialog row={row} month={month} open={activeDialog === "adjustment"} onOpenChange={(open) => setActiveDialog(open ? "adjustment" : null)} />
            <PayoutDialog row={row} month={month} open={activeDialog === "payout"} onOpenChange={(open) => setActiveDialog(open ? "payout" : null)} />
        </>
    );
}

function ProfileDialog({ row, month, open, onOpenChange }) {
    const form = useForm({
        base_salary: row.payroll_profile?.base_salary || 0,
        allowance: row.payroll_profile?.allowance || 0,
        attendance_bonus_per_day: row.payroll_profile?.attendance_bonus_per_day || 0,
        absence_deduction_per_day: row.payroll_profile?.absence_deduction_per_day || 0,
        performance_bonus: row.payroll_profile?.performance_bonus || 0,
        overtime_rate_per_hour: row.payroll_profile?.overtime_rate_per_hour || 0,
        effective_from: `${month}-01`,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Salary Template • {row.name}</DialogTitle>
                    <DialogDescription>Update payroll profile for this month.</DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(route("admin.payroll.profile", row.user_id), {
                            preserveScroll: true,
                            onSuccess: () => onOpenChange(false),
                        });
                    }}
                >
                    <Field label="Base Salary" value={form.data.base_salary} onChange={(v) => form.setData("base_salary", v)} />
                    <Field label="Allowance" value={form.data.allowance} onChange={(v) => form.setData("allowance", v)} />
                    <Field label="Attendance Bonus/Day" value={form.data.attendance_bonus_per_day} onChange={(v) => form.setData("attendance_bonus_per_day", v)} />
                    <Field label="Absence Deduction/Day" value={form.data.absence_deduction_per_day} onChange={(v) => form.setData("absence_deduction_per_day", v)} />
                    <Field label="Performance Bonus" value={form.data.performance_bonus} onChange={(v) => form.setData("performance_bonus", v)} />
                    <Field label="OT Rate / Hour" value={form.data.overtime_rate_per_hour} onChange={(v) => form.setData("overtime_rate_per_hour", v)} />
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button className="bg-orange-600 hover:bg-orange-500 text-white dark:bg-orange-500 dark:text-white dark:hover:bg-orange-400" disabled={form.processing}>{form.processing ? "Saving..." : "Save Template"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AdjustmentDialog({ row, month, open, onOpenChange }) {
    const form = useForm({
        type: "bonus",
        amount: "",
        reason: "",
        effective_date: `${month}-01`,
        is_recurring: false,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adjustment • {row.name}</DialogTitle>
                    <DialogDescription>Add monthly bonus, increment, allowance or deduction.</DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(route("admin.payroll.adjustments.store", row.user_id), {
                            preserveScroll: true,
                            onSuccess: () => onOpenChange(false),
                        });
                    }}
                >
                    <div className="space-y-1">
                        <Label>Type</Label>
                        <Select value={form.data.type} onChange={(e) => form.setData("type", e.target.value)}>
                            <option value="bonus">Bonus</option>
                            <option value="increment">Increment</option>
                            <option value="allowance">Allowance</option>
                            <option value="deduction">Deduction</option>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Amount</Label>
                        <Input type="number" min="0.01" step="0.01" value={form.data.amount} onChange={(e) => form.setData("amount", e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                        <Label>Reason</Label>
                        <Input value={form.data.reason} onChange={(e) => form.setData("reason", e.target.value)} required />
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <input type="checkbox" checked={form.data.is_recurring} onChange={(e) => form.setData("is_recurring", e.target.checked)} />
                        Recurring monthly
                    </label>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button className="bg-orange-600 hover:bg-orange-500 text-white dark:bg-orange-500 dark:text-white dark:hover:bg-orange-400" disabled={form.processing}>{form.processing ? "Saving..." : "Add Adjustment"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PayoutDialog({ row, month, open, onOpenChange }) {
    const form = useForm({
        period_month: month,
        gross_amount: row.totals?.gross || 0,
        deduction_amount: row.totals?.deduction || 0,
        net_amount: row.totals?.net || 0,
        note: "",
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Payout • {row.name}</DialogTitle>
                    <DialogDescription>Confirm payout values and mark this payroll as paid.</DialogDescription>
                </DialogHeader>
                <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                    <SlipItem label="Worked Days" value={`${numberValue(row.slip?.worked_days)}/${numberValue(row.slip?.expected_days)}`} />
                    <SlipItem label="OT Hours" value={numberValue(row.slip?.overtime_hours)} />
                    <SlipItem label="Bonus Total" value={formatMMK(row.slip?.bonus_total)} />
                    <SlipItem label="Deduction Total" value={formatMMK(row.slip?.deduction_total)} />
                </div>
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(route("admin.payroll.payout", row.user_id), {
                            preserveScroll: true,
                            onSuccess: () => onOpenChange(false),
                        });
                    }}
                >
                    <Field label="Gross" value={form.data.gross_amount} onChange={(v) => form.setData("gross_amount", v)} />
                    <Field label="Deduction" value={form.data.deduction_amount} onChange={(v) => form.setData("deduction_amount", v)} />
                    <Field label="Net" value={form.data.net_amount} onChange={(v) => form.setData("net_amount", v)} />
                    <div className="space-y-1">
                        <Label>Note</Label>
                        <Input value={form.data.note} onChange={(e) => form.setData("note", e.target.value)} placeholder="optional" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button className="bg-orange-600 hover:bg-orange-500 text-white dark:bg-orange-500 dark:text-white dark:hover:bg-orange-400" disabled={form.processing}>{form.processing ? "Saving..." : "Mark as Paid"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, value, onChange }) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} required />
        </div>
    );
}

function Kpi({ label, value, tone = "slate" }) {
    const tones = {
        slate: "border-slate-200 text-slate-800 dark:border-slate-700 dark:text-slate-100",
        orange: "border-orange-200 text-orange-800 dark:border-orange-500/30 dark:text-orange-200",
        amber: "border-amber-200 text-amber-800 dark:border-amber-500/30 dark:text-amber-200",
    };
    return (
        <div className={`rounded-xl border bg-white p-4 dark:bg-slate-900 ${tones[tone] || tones.slate}`}>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-xl font-black">{value}</p>
        </div>
    );
}

function Pagination({ rows, onChange }) {
    if (!rows) return null;
    const current = Number(rows.current_page || 1);
    const from = rows.from || 0;
    const to = rows.to || 0;
    const hasPrev = Boolean(rows.prev_page_url);
    const hasNext = Boolean(rows.next_page_url);

    return (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {from} - {to}
            </p>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" disabled={!hasPrev} onClick={() => onChange(current - 1)}>Previous</Button>
                <span className="text-xs text-slate-500 dark:text-slate-400">Page {current}</span>
                <Button size="sm" variant="secondary" className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" disabled={!hasNext} onClick={() => onChange(current + 1)}>Next</Button>
            </div>
        </div>
    );
}

function SlipItem({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</p>
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
