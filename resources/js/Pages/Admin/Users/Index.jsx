import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import Swal from "sweetalert2";
import { sanitizePaginationLabel } from "@/utils/sanitizePaginationLabel";

export default function Index({
    users,
    roles,
    shops,
    type = "staff",
    search = "",
}) {
    const { auth } = usePage().props;
    const role = auth?.role || "admin";
    const canManageUsers = ["admin", "manager"].includes(role);
    const canDeleteUsers = role === "admin";
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "manager",
        shop_id: "",
    });
    const [query, setQuery] = useState(search);

    const staffRoles = ["manager", "sales", "delivery"];
    const rows = users?.data || [];

    const createStaff = (e) => {
        e.preventDefault();
        router.post(route("admin.users.store"), form, {
            onSuccess: () =>
                Swal.fire("Success", "Staff created.", "success"),
            onError: () =>
                Swal.fire("Error", "Please check the form.", "error"),
        });
    };

    const updateUser = (userId, role, shopId) => {
        Swal.fire({
            title: "Confirm",
            text: "Update this user?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Update",
        }).then((result) => {
            if (!result.isConfirmed) return;
            router.patch(route("admin.users.update", userId), {
                role,
                shop_id: shopId || null,
            }, {
                onSuccess: () =>
                    Swal.fire("Updated", "User updated.", "success"),
            });
        });
    };

    const deleteUser = (userId) => {
        Swal.fire({
            title: "Delete user?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then((result) => {
            if (!result.isConfirmed) return;
            router.delete(route("admin.users.destroy", userId), {
                onSuccess: () =>
                    Swal.fire("Deleted", "User removed.", "success"),
            });
        });
    };

    return (
        <AdminLayout header="Users & Staff">
            <Head title="Admin Users" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                    <Link
                        href={route("admin.users.index", { type: "staff", search: query || undefined })}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold border ${
                            type === "staff"
                                ? "bg-white text-slate-900 border-slate-200 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200"
                                : "bg-transparent text-slate-600 border-transparent dark:text-slate-300"
                        }`}
                    >
                        Staff
                    </Link>
                    <Link
                        href={route("admin.users.index", { type: "customers", search: query || undefined })}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold border ${
                            type === "customers"
                                ? "bg-white text-slate-900 border-slate-200 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200"
                                : "bg-transparent text-slate-600 border-transparent dark:text-slate-300"
                        }`}
                    >
                        Customers
                    </Link>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get(route("admin.users.index"), { type, search: query || undefined }, { preserveState: true, replace: true });
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900">
                        Search
                    </button>
                </form>
            </div>

            {type === "staff" && canManageUsers && (
                <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                    <h3 className="mb-4 font-bold text-slate-800 dark:text-slate-100">
                        Create Staff
                    </h3>
                    <form onSubmit={createStaff} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input
                            type="text"
                            placeholder="Name"
                            className="rounded-lg border border-slate-300 bg-white pl-3 pr-8 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="rounded-lg border border-slate-300 bg-white pl-3 pr-8 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password (optional)"
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                        <select
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            {roles.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                        <select
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            value={form.shop_id}
                            onChange={(e) => setForm({ ...form, shop_id: e.target.value })}
                            disabled={!staffRoles.includes(form.role)}
                        >
                            <option value="">Select shop</option>
                            {shops.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <div className="md:col-span-5">
                            <button className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white">
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <div className="border-b border-slate-50 p-6 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                        {type === "staff" ? "Staff" : "Customers"}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 text-[11px] uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:text-slate-500">
                                <th className="px-6 py-4 font-bold">Name</th>
                                <th className="px-6 py-4 font-bold">Email</th>
                                <th className="px-6 py-4 font-bold">Role</th>
                                {type === "staff" && <th className="px-6 py-4 font-bold">Shop</th>}
                                {type === "staff" && <th className="px-6 py-4 font-bold">Active Time</th>}
                                <th className="px-6 py-4 font-bold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {rows.length ? (
                                rows.map((user) => {
                                    const currentRole = user.roles?.[0]?.name || "customer";
                                    return (
                                        <tr
                                            key={user.id}
                                            className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {type === "staff" && canManageUsers ? (
                                                    <select
                                                        className="rounded-lg border border-slate-300 bg-white pl-2 pr-8 py-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                        defaultValue={currentRole}
                                                        onChange={(e) =>
                                                            updateUser(user.id, e.target.value, user.shop_id)
                                                        }
                                                    >
                                                        {roles.map((r) => (
                                                            <option key={r} value={r}>
                                                                {r}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-slate-500 dark:text-slate-400">
                                                        {currentRole}
                                                    </span>
                                                )}
                                            </td>
                                            {type === "staff" && (
                                                <>
                                                    <td className="px-6 py-4 text-sm">
                                                        {canManageUsers ? (
                                                            <select
                                                                className="rounded-lg border border-slate-300 bg-white pl-2 pr-8 py-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                                defaultValue={user.shop_id || ""}
                                                                onChange={(e) =>
                                                                    updateUser(user.id, currentRole, e.target.value)
                                                                }
                                                                disabled={!staffRoles.includes(currentRole)}
                                                            >
                                                                <option value="">Select shop</option>
                                                                {shops.map((s) => (
                                                                    <option key={s.id} value={s.id}>
                                                                        {s.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span>{user.shop?.name || "Not assigned"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                        {Math.floor((user.attendance_today?.worked_minutes || 0) / 60)}h {(user.attendance_today?.worked_minutes || 0) % 60}m
                                                        <span className={`ms-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.attendance_today?.checked_in ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                                                            {user.attendance_today?.checked_in ? "On Duty" : "Off"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={route("admin.users.show", user.id)}
                                                                className="inline-flex items-center rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                                            >
                                                                View
                                                            </Link>
                                                            {canDeleteUsers ? (
                                                                <button
                                                                    onClick={() => deleteUser(user.id)}
                                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                                                    title="Delete user"
                                                                    aria-label="Delete user"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M6 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6-1a1 1 0 10-2 0v7a1 1 0 102 0V7zm-7-3a2 2 0 012-2h6a2 2 0 012 2v1h2a1 1 0 110 2h-1v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 010-2h2V4z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                            {type !== "staff" && (
                                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route("admin.users.show", user.id)}
                                                            className="inline-flex items-center rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                                        >
                                                            View
                                                        </Link>
                                                        {canDeleteUsers ? (
                                                            <button
                                                                onClick={() => deleteUser(user.id)}
                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                                                title="Delete user"
                                                                aria-label="Delete user"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M6 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6-1a1 1 0 10-2 0v7a1 1 0 102 0V7zm-7-3a2 2 0 012-2h6a2 2 0 012 2v1h2a1 1 0 110 2h-1v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 010-2h2V4z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={type === "staff" ? 6 : 4}
                                        className="p-12 text-center text-slate-400 italic dark:text-slate-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {users?.links?.length > 1 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {users.links.map((link, idx) => (
                        <Link
                            key={`${link.label}-${idx}`}
                            href={link.url || "#"}
                            className={`px-3 py-1 rounded border text-sm ${
                                link.active
                                    ? "bg-orange-600 text-white border-orange-600"
                                    : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                            } ${!link.url ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            {sanitizePaginationLabel(link.label)}
                        </Link>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
