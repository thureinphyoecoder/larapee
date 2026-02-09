import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function AuditLogsIndex({ logs, filters = {} }) {
    const [event, setEvent] = useState(filters?.event || "");

    const rows = logs?.data || [];

    return (
        <AdminLayout header="Audit Logs">
            <Head title="Audit Logs" />

            <div className="space-y-5">
                <form
                    className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        window.location.href = route("admin.audit-logs.index", { event: event || undefined });
                    }}
                >
                    <input className="border border-slate-300 rounded-xl px-3 py-2.5" placeholder="Filter by event" value={event} onChange={(e) => setEvent(e.target.value)} />
                    <button className="bg-slate-900 text-white rounded-xl font-bold">Apply</button>
                    <a href={route("admin.audit-logs.index")} className="text-center border border-slate-300 rounded-xl px-3 py-2.5 font-semibold text-slate-600">Reset</a>
                </form>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left">Time</th>
                                <th className="px-4 py-3 text-left">Event</th>
                                <th className="px-4 py-3 text-left">Actor</th>
                                <th className="px-4 py-3 text-left">Auditable</th>
                                <th className="px-4 py-3 text-left">Old</th>
                                <th className="px-4 py-3 text-left">New</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 align-top">
                                    <td className="px-4 py-3 whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-semibold">{row.event}</td>
                                    <td className="px-4 py-3">{row.actor?.name || "system"}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{row.auditable_type || "-"}#{row.auditable_id || ""}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600"><pre className="whitespace-pre-wrap">{JSON.stringify(row.old_values || {}, null, 2)}</pre></td>
                                    <td className="px-4 py-3 text-xs text-slate-600"><pre className="whitespace-pre-wrap">{JSON.stringify(row.new_values || {}, null, 2)}</pre></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
