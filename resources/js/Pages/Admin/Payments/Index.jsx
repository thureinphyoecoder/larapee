import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useMemo, useState, useCallback } from "react";
import {
    FaArrowRotateLeft,
    FaArrowRightArrowLeft,
    FaBoxOpen,
    FaClipboardList,
    FaClock,
    FaFloppyDisk,
    FaMagnifyingGlass,
    FaMoneyBillTransfer,
    FaReceipt,
    FaSackDollar,
    FaTag,
    FaTriangleExclamation,
    FaUser,
    FaWallet,
    FaCircleCheck,
    FaCircleXmark,
    FaHourglassHalf,
    FaInbox,
    FaPenToSquare,
    FaLink,
} from "react-icons/fa6";
import { sanitizePaginationLabel } from "@/utils/sanitizePaginationLabel";

// ===== CONSTANTS =====
const STATUS_OPTIONS = [
    { value: "", label: "အားလုံး" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "refund_requested", label: "Refund Requested" },
    { value: "refunded", label: "Refunded" },
    { value: "returned", label: "Returned" },
];

// ===== REUSABLE COMPONENTS =====
function MetricCard({ label, value, icon, tone = "slate" }) {
    const toneClasses = {
        slate: "from-slate-600 to-slate-700 border-slate-300",
        emerald: "from-emerald-500 to-emerald-600 border-emerald-300",
        rose: "from-rose-500 to-rose-600 border-rose-300",
        amber: "from-amber-500 to-amber-600 border-amber-300",
    };

    return (
        <div
            className={`rounded-2xl p-5 shadow-lg border-2 bg-gradient-to-br text-white ${toneClasses[tone]}`}
        >
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                    {label}
                </p>
                {icon && <span className="text-2xl">{icon}</span>}
            </div>
            <p className="text-2xl font-black">{value}</p>
        </div>
    );
}

function FormInput({ label, className = "", ...props }) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                    {label}
                </label>
            )}
            <input
                className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                {...props}
            />
        </div>
    );
}

function FormSelect({ label, options, className = "", ...props }) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                    {label}
                </label>
            )}
            <select
                className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function OrderSelect({
    value,
    onChange,
    orders,
    placeholder = "Select order",
    required = false,
}) {
    const options = [
        { value: "", label: placeholder },
        ...orders.map((o) => ({
            value: o.id,
            label: `${o.invoice_no || `#${o.id}`} - ${o.user?.name || "Unknown"}`,
        })),
    ];

    return (
        <FormSelect
            options={options}
            value={value}
            onChange={onChange}
            required={required}
        />
    );
}

function InlineError({ text }) {
    return text ? (
        <p className="mt-1 text-xs font-semibold text-rose-600">
            <FaTriangleExclamation className="mr-1 inline h-3 w-3" />
            {text}
        </p>
    ) : null;
}

function EmptyState({ message, colSpan, icon = <FaInbox /> }) {
    return (
        <tr>
            <td colSpan={colSpan} className="py-12 text-center">
                <div className="text-slate-400">
                    <div className="mb-3 flex justify-center text-4xl">{icon}</div>
                    <p className="font-semibold">{message}</p>
                </div>
            </td>
        </tr>
    );
}

function PaginationLinks({ links }) {
    if (!links || links.length <= 1) return null;

    return (
        <div className="mt-5 flex flex-wrap gap-2">
            {links.map((link, idx) => (
                <Link
                    key={`${link.label}-${idx}`}
                    href={link.url || "#"}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                        link.active
                            ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-600 shadow-lg"
                            : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"
                    } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                >
                    {sanitizePaginationLabel(link.label)}
                </Link>
            ))}
        </div>
    );
}

function SectionCard({ title, subtitle, icon, children, className = "" }) {
    return (
        <div
            className={`bg-gradient-to-br from-white to-slate-50 rounded-3xl border-2 border-slate-200 p-6 shadow-sm ${className}`}
        >
            <div className="flex items-center gap-3 mb-4">
                {icon && (
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">
                        {icon}
                    </div>
                )}
                <div>
                    <h3 className="font-black text-slate-900 text-lg">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-slate-600 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

// ===== COMPLEX COMPONENTS =====
function ApprovalRequestForm({ orders, orderAmountById, approvalForm }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        approvalForm.post(route("admin.payments.approvals.store"), {
            preserveScroll: true,
        });
    };

    const handleOrderChange = (e) => {
        const orderId = e.target.value;
        approvalForm.setData("order_id", orderId);
        const amount = orderAmountById.get(orderId);
        if (amount !== undefined) {
            approvalForm.setData("amount", String(amount));
        }
    };

    const handleTypeChange = (e) => {
        const requestType = e.target.value;
        approvalForm.setData("request_type", requestType);
        if (requestType === "refund") {
            const amount = orderAmountById.get(
                String(approvalForm.data.order_id),
            );
            if (amount !== undefined) {
                approvalForm.setData("amount", String(amount));
            }
        }
    };

    return (
        <SectionCard
            title="Request Approval"
            subtitle="Refund သို့မဟုတ် Discount အတွက် အတည်ပြုချက် တောင်းခံရန်"
            icon={<FaPenToSquare />}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <OrderSelect
                    value={approvalForm.data.order_id}
                    onChange={handleOrderChange}
                    orders={orders}
                    placeholder="Order ရွေးချယ်ပါ..."
                    required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormSelect
                        options={[
                            { value: "refund", label: "Refund" },
                            { value: "discount", label: "Discount" },
                        ]}
                        value={approvalForm.data.request_type}
                        onChange={handleTypeChange}
                    />
                    <FormInput
                        type="number"
                        min="0"
                        placeholder="ငွေပမာဏ"
                        value={approvalForm.data.amount}
                        onChange={(e) =>
                            approvalForm.setData("amount", e.target.value)
                        }
                    />
                </div>

                <FormInput
                    placeholder="အကြောင်းပြချက်"
                    value={approvalForm.data.reason}
                    onChange={(e) =>
                        approvalForm.setData("reason", e.target.value)
                    }
                    required
                />

                <InlineError
                    text={
                        approvalForm.errors?.order_id ||
                        approvalForm.errors?.reason
                    }
                />

                <button
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-orange-200 transition-all duration-200 disabled:opacity-60"
                    disabled={approvalForm.processing}
                >
                    {approvalForm.processing
                        ? "Submitting..."
                        : "Submit Request"}
                </button>
            </form>
        </SectionCard>
    );
}

function PendingApprovalsList({ pendingApprovals, links }) {
    return (
        <SectionCard
            title="Pending Approvals"
            subtitle="အတည်ပြုရန် စောင့်ဆိုင်းနေသော တောင်းဆိုမှုများ"
            icon={<FaHourglassHalf />}
        >
            <div className="bg-white rounded-xl border-2 border-amber-200 px-4 py-2 mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-700">
                    စောင့်ဆိုင်းနေသော တောင်းဆိုမှု
                </span>
                <span className="text-lg font-black text-amber-600">
                    {pendingApprovals.length}
                </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-auto">
                {pendingApprovals.length > 0 ? (
                    pendingApprovals.map((row) => (
                        <div
                            key={row.id}
                            className="border-2 border-slate-200 rounded-xl p-4 bg-white hover:border-amber-300 transition"
                        >
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="font-bold text-slate-900">
                                    #{row.id} •{" "}
                                    {row.request_type === "refund"
                                        ? "Refund"
                                        : "Discount"}
                                </p>
                                <span className="text-xs uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-bold">
                                    Pending
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 font-semibold">
                                {row.order?.invoice_no || `#${row.order_id}`}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {row.reason}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <button
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-200 transition-all"
                                    onClick={() =>
                                        router.post(
                                            route(
                                                "admin.payments.approvals.approve",
                                                row.id,
                                            ),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    Approve
                                </button>
                                <button
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-sm font-bold shadow-lg shadow-rose-200 transition-all"
                                    onClick={() =>
                                        router.post(
                                            route(
                                                "admin.payments.approvals.reject",
                                                row.id,
                                            ),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 text-center py-8">
                        စောင့်ဆိုင်းနေသော တောင်းဆိုမှု မရှိပါ။
                    </p>
                )}
            </div>

            <PaginationLinks links={links} />
        </SectionCard>
    );
}

function QuickEventCard({ title, actionRoute, orders, buttonClass, icon }) {
    const isRefund = actionRoute === "admin.payments.orders.refund";
    const isReject = actionRoute === "admin.payments.orders.reject";
    const isVerify = actionRoute === "admin.payments.orders.verify";

    const form = useForm({
        order_id: "",
        amount: "",
        reference_no: "",
        note: "",
    });

    const orderAmountById = useMemo(() => {
        const map = new Map();
        orders.forEach((o) =>
            map.set(String(o.id), Number(o.total_amount || 0)),
        );
        return map;
    }, [orders]);

    const handleOrderChange = (e) => {
        const orderId = e.target.value;
        form.setData("order_id", orderId);
        if (isVerify) {
            const amount = orderAmountById.get(orderId);
            if (amount !== undefined) form.setData("amount", String(amount));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.data.order_id) return;
        form.post(route(actionRoute, form.data.order_id), {
            preserveScroll: true,
        });
    };

    return (
        <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                {icon && <span className="text-2xl">{icon}</span>}
                <h4 className="font-black text-slate-900">{title}</h4>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <OrderSelect
                    value={form.data.order_id}
                    onChange={handleOrderChange}
                    orders={orders}
                    required
                />

                {isRefund ? (
                    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-xs text-emerald-700 font-semibold">
                            Refund ပမာဏကို Order total ဖြင့် အလိုအလျောက်
                            တွက်ချက်ပေးပါမည်။
                        </p>
                    </div>
                ) : (
                    !isReject && (
                        <FormInput
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={
                                isVerify
                                    ? "ငွေပမာဏ (အလိုအလျောက်)"
                                    : "ငွေပမာဏ"
                            }
                            value={form.data.amount}
                            onChange={(e) =>
                                form.setData("amount", e.target.value)
                            }
                        />
                    )
                )}

                <FormInput
                    placeholder="Reference No (ရွေးချယ်ရန်)"
                    value={form.data.reference_no}
                    onChange={(e) =>
                        form.setData("reference_no", e.target.value)
                    }
                />

                <FormInput
                    placeholder={
                        isReject || isRefund
                            ? "အကြောင်းပြချက်"
                            : "မှတ်ချက်"
                    }
                    value={form.data.note}
                    onChange={(e) => form.setData("note", e.target.value)}
                    required={!isVerify}
                />

                <button
                    className={`w-full text-white rounded-xl py-3.5 font-bold shadow-lg transition-all duration-200 disabled:opacity-60 ${buttonClass}`}
                    disabled={form.processing}
                >
                    {form.processing ? "သိမ်းနေသည်..." : "သိမ်းမည်"}
                </button>
            </form>
        </div>
    );
}

function FinancialAdjustmentForm({
    orders,
    approvalRows,
    orderAmountById,
    adjustmentForm,
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        adjustmentForm.post(route("admin.payments.adjustments.store"), {
            preserveScroll: true,
        });
    };

    const handleOrderChange = (e) => {
        const orderId = e.target.value;
        adjustmentForm.setData("order_id", orderId);
        const amount = orderAmountById.get(orderId);
        if (amount !== undefined) {
            adjustmentForm.setData("amount", String(amount));
        }
    };

    return (
        <SectionCard
            title="Financial Adjustment"
            subtitle="ငွေကြေး ပြင်ဆင်မှု မှတ်တမ်း ထည့်သွင်းရန်"
            icon={<FaSackDollar />}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <OrderSelect
                    value={adjustmentForm.data.order_id}
                    onChange={handleOrderChange}
                    orders={orders}
                    placeholder="Order ရွေးချယ်ပါ..."
                    required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormSelect
                        options={[
                            { value: "adjustment", label: "Adjustment" },
                            { value: "reversal", label: "Reversal" },
                        ]}
                        value={adjustmentForm.data.adjustment_type}
                        onChange={(e) =>
                            adjustmentForm.setData(
                                "adjustment_type",
                                e.target.value,
                            )
                        }
                    />
                    <FormInput
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="ငွေပမာဏ"
                        value={adjustmentForm.data.amount}
                        onChange={(e) =>
                            adjustmentForm.setData("amount", e.target.value)
                        }
                        required
                    />
                </div>

                <FormInput
                    placeholder="အကြောင်းပြချက်"
                    value={adjustmentForm.data.reason}
                    onChange={(e) =>
                        adjustmentForm.setData("reason", e.target.value)
                    }
                    required
                />

                <FormSelect
                    options={[
                        {
                            value: "",
                            label: "Approval ချိတ်ဆက်ရန် (ရွေးချယ်ရန်)",
                        },
                        ...approvalRows.map((row) => ({
                            value: row.id,
                            label: `#${row.id} - ${row.request_type} (${row.status})`,
                        })),
                    ]}
                    value={adjustmentForm.data.approval_request_id}
                    onChange={(e) =>
                        adjustmentForm.setData(
                            "approval_request_id",
                            e.target.value,
                        )
                    }
                />

                <InlineError
                    text={
                        adjustmentForm.errors?.order_id ||
                        adjustmentForm.errors?.amount
                    }
                />

                <button
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-slate-300 transition-all duration-200 disabled:opacity-60"
                    disabled={adjustmentForm.processing}
                >
                    {adjustmentForm.processing
                        ? "သိမ်းနေသည်..."
                        : "သိမ်းမည်"}
                </button>
            </form>
        </SectionCard>
    );
}

// ===== MAIN COMPONENT =====
export default function PaymentsIndex({
    orders,
    payments,
    approvals,
    adjustments,
    filters = {},
}) {
    const [q, setQ] = useState(filters?.q || "");
    const [status, setStatus] = useState(filters?.status || "");

    const approvalForm = useForm({
        order_id: "",
        request_type: "refund",
        amount: "",
        reason: "",
    });
    const adjustmentForm = useForm({
        order_id: "",
        adjustment_type: "adjustment",
        amount: "",
        reason: "",
        approval_request_id: "",
    });

    const rows = orders?.data || [];
    const approvalRows = approvals?.data || [];
    const adjustmentRows = adjustments?.data || [];
    const paymentRows = payments?.data || [];

    // ===== COMPUTED VALUES =====
    const totals = useMemo(() => {
        return rows.reduce(
            (acc, order) => {
                acc.gross += Number(order.total_amount || 0);
                if (
                    ["refund_requested", "refunded", "returned"].includes(
                        order.status,
                    )
                ) {
                    acc.refund += Number(order.total_amount || 0);
                }
                return acc;
            },
            { gross: 0, refund: 0 },
        );
    }, [rows]);

    const pendingApprovals = useMemo(
        () => approvalRows.filter((row) => row.status === "pending"),
        [approvalRows],
    );

    const orderAmountById = useMemo(() => {
        const map = new Map();
        rows.forEach((row) =>
            map.set(String(row.id), Number(row.total_amount || 0)),
        );
        return map;
    }, [rows]);

    // ===== EVENT HANDLERS =====
    const submitFilters = (e) => {
        e.preventDefault();
        router.get(
            route("admin.payments.index"),
            {
                q: q || undefined,
                status: status || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setQ("");
        setStatus("");
        router.get(
            route("admin.payments.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout header="Payment Management">
            <Head title="Payment Management" />

            <div className="space-y-8 pb-8">
                {/* Header Section */}
                <section className="bg-gradient-to-br from-white to-indigo-50/30 rounded-3xl border-2 border-indigo-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                            <FaWallet className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold">
                                Finance Console
                            </p>
                            <h1 className="text-2xl font-black text-slate-900">
                                Payments & Approvals
                            </h1>
                            <p className="text-sm text-slate-600 mt-1">
                                Refund၊ Verification၊ Rejection နှင့် Adjustment
                                များကို တစ်နေရာတည်းမှ စီမံခန့်ခွဲနိုင်ပါသည်
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <MetricCard
                            label="Orders (လက်ရှိ Page)"
                            value={rows.length}
                            icon={<FaBoxOpen />}
                            tone="slate"
                        />
                        <MetricCard
                            label="စုစုပေါင်း ငွေပမာဏ"
                            value={`${totals.gross.toLocaleString()} MMK`}
                            icon={<FaSackDollar />}
                            tone="emerald"
                        />
                        <MetricCard
                            label="Refund ဖြစ်နိုင်ခြေ"
                            value={`${totals.refund.toLocaleString()} MMK`}
                            icon={<FaMoneyBillTransfer />}
                            tone="rose"
                        />
                    </div>
                </section>

                {/* Search & Filter */}
                <SectionCard
                    title="Order ရှာဖွေရန်"
                    subtitle="Invoice၊ Receipt သို့မဟုတ် Customer အမည်ဖြင့် ရှာဖွေပါ"
                    icon={<FaMagnifyingGlass />}
                >
                    <form
                        onSubmit={submitFilters}
                        className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3"
                    >
                        <FormInput
                            placeholder="Invoice / Receipt / Customer"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                        <FormSelect
                            options={STATUS_OPTIONS}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="md:w-52"
                        />
                        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all">
                            <FaMagnifyingGlass className="h-3.5 w-3.5" />
                            ရှာမည်
                        </button>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 bg-white hover:bg-slate-50 rounded-xl font-semibold text-slate-700 text-sm transition-all"
                        >
                            <FaArrowRotateLeft className="h-3.5 w-3.5" />
                            Reset
                        </button>
                    </form>
                </SectionCard>

                {/* Approval Request & Pending Approvals */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <ApprovalRequestForm
                        orders={rows}
                        orderAmountById={orderAmountById}
                        approvalForm={approvalForm}
                    />
                    <PendingApprovalsList
                        pendingApprovals={pendingApprovals}
                        links={approvals?.links}
                    />
                </section>

                {/* Quick Actions */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <QuickEventCard
                        title="Verify Payment"
                        icon={<FaCircleCheck />}
                        actionRoute="admin.payments.orders.verify"
                        orders={rows}
                        buttonClass="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-200"
                    />
                    <QuickEventCard
                        title="Reject Payment"
                        icon={<FaCircleXmark />}
                        actionRoute="admin.payments.orders.reject"
                        orders={rows}
                        buttonClass="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-200"
                    />
                    <QuickEventCard
                        title="Refund Payment"
                        icon={<FaMoneyBillTransfer />}
                        actionRoute="admin.payments.orders.refund"
                        orders={rows}
                        buttonClass="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-200"
                    />
                </section>

                {/* Orders Table */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                        <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                            <FaClipboardList className="h-4 w-4" /> Order Payment စာရင်း
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr className="text-left text-slate-600 font-bold text-xs border-b-2 border-slate-200">
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaReceipt className="h-3 w-3" />Invoice</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaTag className="h-3 w-3" />Receipt</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaUser className="h-3 w-3" />Customer</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaSackDollar className="h-3 w-3" />Amount</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaClipboardList className="h-3 w-3" />Status</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length > 0 ? (
                                    rows.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-indigo-50/30 transition-all"
                                        >
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                {order.invoice_no || "—"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {order.receipt_no || "—"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {order.user?.name || "—"}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {Number(
                                                    order.total_amount || 0,
                                                ).toLocaleString()}{" "}
                                                <span className="text-xs text-slate-500">
                                                    MMK
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700">
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState
                                        message="Orders မတွေ့ပါ"
                                        colSpan={5}
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>
                    <PaginationLinks links={orders?.links} />
                </div>

                {/* Adjustment Form & List */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <FinancialAdjustmentForm
                        orders={rows}
                        approvalRows={approvalRows}
                        orderAmountById={orderAmountById}
                        adjustmentForm={adjustmentForm}
                    />

                    <SectionCard
                        title="Financial Adjustments"
                        subtitle="ငွေကြေး ပြင်ဆင်မှု မှတ်တမ်းများ"
                        icon={<FaSackDollar />}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 border-b-2 border-slate-200">
                                    <tr className="text-left text-slate-600 font-bold text-xs">
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Order</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {adjustmentRows.length > 0 ? (
                                        adjustmentRows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-slate-50 transition"
                                            >
                                                <td className="px-4 py-3 font-semibold">
                                                    #{row.id}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {row.order?.invoice_no ||
                                                        row.order_id}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs uppercase font-bold text-slate-600">
                                                        {row.adjustment_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    {Number(
                                                        row.amount,
                                                    ).toLocaleString()}{" "}
                                                    MMK
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {row.creator?.name || "—"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <EmptyState
                                            message="Adjustments မရှိသေးပါ"
                                            colSpan={5}
                                        />
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <PaginationLinks links={adjustments?.links} />
                    </SectionCard>
                </section>

                {/* Payment Ledger */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-slate-200">
                        <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                            <FaClipboardList className="h-4 w-4" /> Payment Ledger Events
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                            ငွေပေးချေမှု မှတ်တမ်း အားလုံး
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr className="text-left text-slate-600 font-bold text-xs border-b-2 border-slate-200">
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaClock className="h-3 w-3" />အချိန်</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaReceipt className="h-3 w-3" />Order</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaClipboardList className="h-3 w-3" />Event</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaSackDollar className="h-3 w-3" />Amount</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaClipboardList className="h-3 w-3" />Status</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaUser className="h-3 w-3" />Actor</span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2"><FaPenToSquare className="h-3 w-3" />Note</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paymentRows.length > 0 ? (
                                    paymentRows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-blue-50/30 transition-all"
                                        >
                                            <td className="px-6 py-4 text-xs text-slate-600">
                                                {new Date(
                                                    row.created_at,
                                                ).toLocaleString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                {row.order?.invoice_no ||
                                                    row.order_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs uppercase font-bold text-indigo-600">
                                                    {row.event_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {Number(
                                                    row.amount,
                                                ).toLocaleString()}{" "}
                                                {row.currency || "MMK"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {row.actor?.name || "system"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {row.note || "—"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState
                                        message="Ledger မှတ်တမ်း မရှိသေးပါ"
                                        colSpan={7}
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>
                    <PaginationLinks links={payments?.links} />
                </div>
            </div>
        </AdminLayout>
    );
}
