import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { sanitizePaginationLabel } from "@/utils/sanitizePaginationLabel";

export default function AuditLogsIndex({ logs, filters = {} }) {
    const [event, setEvent] = useState(filters?.event || "");

    const rows = logs?.data || [];
    const summary = useMemo(() => {
        const actorCount = new Set(rows.map((row) => row.actor?.id).filter(Boolean)).size;
        const mutationCount = rows.filter((row) => hasValues(row.old_values) || hasValues(row.new_values)).length;
        return {
            total: rows.length,
            actors: actorCount,
            mutations: mutationCount,
        };
    }, [rows]);

    return (
        <AdminLayout header="Audit Logs">
            <Head title="Audit Logs" />

            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <MetricCard label="Events" value={summary.total} />
                    <MetricCard label="Actors" value={summary.actors} />
                    <MetricCard label="Changes" value={summary.mutations} />
                </div>

                <form
                    className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 dark:border-slate-700 dark:bg-slate-900/80"
                    onSubmit={(e) => {
                        e.preventDefault();
                        window.location.href = route("admin.audit-logs.index", { event: event || undefined });
                    }}
                >
                    <input
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Filter by event"
                        value={event}
                        onChange={(e) => setEvent(e.target.value)}
                    />
                    <button className="rounded-xl bg-slate-900 font-bold text-white dark:bg-slate-100 dark:text-slate-900">Apply</button>
                    <a href={route("admin.audit-logs.index")} className="text-center border border-slate-300 rounded-xl px-3 py-2.5 font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">Reset</a>
                </form>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            <tr>
                                <th className="px-4 py-3 text-left">Time</th>
                                <th className="px-4 py-3 text-left">Action</th>
                                <th className="px-4 py-3 text-left">Actor</th>
                                <th className="px-4 py-3 text-left">Target</th>
                                <th className="px-4 py-3 text-left">Before</th>
                                <th className="px-4 py-3 text-left">After</th>
                                <th className="px-4 py-3 text-left">Summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{new Date(row.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{formatEventLabel(row.event)}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.actor?.name || "system"}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{formatAuditable(row.auditable_type, row.auditable_id)}</td>
                                    <td className="px-4 py-3">{renderValuePreview(row.old_values, "bg-rose-50 text-rose-700")}</td>
                                    <td className="px-4 py-3">{renderValuePreview(row.new_values, "bg-emerald-50 text-emerald-700")}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{buildHumanSummary(row)}</td>
                                </tr>
                            ))}
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                                        No audit records found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                {logs?.links?.length > 1 ? (
                    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                        {logs.links.map((link, idx) => (
                            <Link
                                key={`${link.label}-${idx}`}
                                href={link.url || "#"}
                                className={`px-3 py-1.5 rounded border text-sm ${
                                    link.active
                                        ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                                        : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                } ${!link.url ? "opacity-50 pointer-events-none" : ""}`}
                            >
                                {sanitizePaginationLabel(link.label)}
                            </Link>
                        ))}
                    </div>
                ) : null}
            </div>
        </AdminLayout>
    );
}

function MetricCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );
}

function hasValues(values) {
    return values && typeof values === "object" && Object.keys(values).length > 0;
}

function formatAuditable(type, id) {
    if (!type && !id) return "-";
    const short = String(type || "").split("\\").pop() || "Record";
    return `${short}${id ? ` #${id}` : ""}`;
}

function renderValuePreview(values, toneClass) {
    if (!hasValues(values)) {
        return <span className="text-xs text-slate-400 dark:text-slate-500">-</span>;
    }

    const entries = Object.entries(values).slice(0, 4);
    return (
        <div className="flex flex-wrap gap-1">
            {entries.map(([key, val]) => (
                <span key={key} className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] dark:bg-slate-800 dark:text-slate-300 ${toneClass}`}>
                    {key}: {String(val)}
                </span>
            ))}
            {Object.keys(values).length > entries.length ? (
                <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    +{Object.keys(values).length - entries.length}
                </span>
            ) : null}
        </div>
    );
}

function formatEventLabel(event) {
    const key = String(event || "").toLowerCase();
    const labels = {
        "order.created": "Order Created",
        "order.status.updated": "Order Status Updated",
        "payment.verified": "Payment Verified",
        "payment.rejected": "Payment Rejected",
        "payment.refunded": "Payment Refunded",
        "inventory.adjusted": "Inventory Adjusted",
        "inventory.transferred": "Stock Transferred",
        "approval.requested": "Approval Requested",
        "approval.approved": "Approval Approved",
        "approval.rejected": "Approval Rejected",
        "service.job.created": "Service Job Created",
    };

    if (labels[key]) return labels[key];
    if (!key) return "Activity";

    return key
        .replaceAll(".", " ")
        .replaceAll("_", " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ");
}

function buildHumanSummary(row) {
    const newValues = row?.new_values && typeof row.new_values === "object" ? row.new_values : {};
    const oldValues = row?.old_values && typeof row.old_values === "object" ? row.old_values : {};

    if (newValues.status && oldValues.status && newValues.status !== oldValues.status) {
        return `Status changed from ${oldValues.status} to ${newValues.status}.`;
    }

    if (newValues.total_amount) {
        return `Amount ${Number(newValues.total_amount).toLocaleString()} MMK.`;
    }

    if (Object.keys(newValues).length > 0) {
        return `Updated ${Object.keys(newValues).length} fields.`;
    }

    if (Object.keys(oldValues).length > 0) {
        return `Previous data had ${Object.keys(oldValues).length} fields.`;
    }

    return "System activity recorded.";
}
