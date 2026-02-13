import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";

export default function ServiceJobsIndex({ stats = {}, jobs = [], failedJobs = [], batches = [] }) {
    const retryForm = useForm({ failed_job_id: "" });
    const closeForm = useForm({ date: "", shop_id: "" });

    return (
        <AdminLayout header="Service Jobs">
            <Head title="Service Jobs" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Metric label="Queued Jobs" value={stats.queued || 0} />
                    <Metric label="Failed Jobs" value={stats.failed || 0} tone="rose" />
                    <Metric label="Job Batches" value={stats.batches || 0} tone="emerald" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                        <h3 className="font-black text-slate-900 dark:text-slate-100">Retry Failed Job</h3>
                        <form
                            className="mt-4 flex gap-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                retryForm.post(route("admin.service-jobs.retry-failed"), { preserveScroll: true });
                            }}
                        >
                            <select
                                className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                value={retryForm.data.failed_job_id}
                                onChange={(e) => retryForm.setData("failed_job_id", e.target.value)}
                                required
                            >
                                <option value="">Select failed job</option>
                                {failedJobs.map((job) => (
                                    <option key={job.id} value={job.id}>#{job.id} [{job.queue}] {job.failed_at}</option>
                                ))}
                            </select>
                            <button className="rounded-xl bg-orange-600 px-4 font-bold text-white hover:bg-orange-500">Retry</button>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                        <h3 className="font-black text-slate-900 dark:text-slate-100">Run Daily Close</h3>
                        <form
                            className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                closeForm.post(route("admin.service-jobs.daily-close"), { preserveScroll: true });
                            }}
                        >
                            <input
                                type="date"
                                className="rounded-xl border border-slate-300 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                value={closeForm.data.date}
                                onChange={(e) => closeForm.setData("date", e.target.value)}
                            />
                            <input
                                type="number"
                                min="1"
                                placeholder="Shop ID (optional)"
                                className="rounded-xl border border-slate-300 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                value={closeForm.data.shop_id}
                                onChange={(e) => closeForm.setData("shop_id", e.target.value)}
                            />
                            <button className="rounded-xl bg-orange-600 px-4 font-bold text-white hover:bg-orange-500">Run</button>
                        </form>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                    <h3 className="p-5 pb-0 font-black text-slate-900 dark:text-slate-100">Queued Jobs</h3>
                    <table className="w-full text-sm mt-3">
                        <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Queue</th>
                                <th className="px-4 py-3 text-left">Attempts</th>
                                <th className="px-4 py-3 text-left">Available At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">#{job.id}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{job.queue}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{job.attempts}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{new Date(Number(job.available_at) * 1000).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                    <h3 className="p-5 pb-0 font-black text-slate-900 dark:text-slate-100">Job Batches</h3>
                    <table className="w-full text-sm mt-3">
                        <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            <tr>
                                <th className="px-4 py-3 text-left">Batch</th>
                                <th className="px-4 py-3 text-left">Total</th>
                                <th className="px-4 py-3 text-left">Pending</th>
                                <th className="px-4 py-3 text-left">Failed</th>
                                <th className="px-4 py-3 text-left">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.name}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.total_jobs}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.pending_jobs}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.failed_jobs}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{new Date(Number(row.created_at) * 1000).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

function Metric({ label, value, tone = "slate" }) {
    const tones = {
        slate: "text-slate-900 border-slate-200 dark:text-slate-100 dark:border-slate-700",
        rose: "text-rose-700 border-rose-200 dark:text-rose-300 dark:border-rose-500/40",
        emerald: "text-emerald-700 border-emerald-200 dark:text-emerald-300 dark:border-emerald-500/40",
    };

    return (
        <div className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900/80 ${tones[tone] || tones.slate}`}>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-xl font-black">{value}</p>
        </div>
    );
}
