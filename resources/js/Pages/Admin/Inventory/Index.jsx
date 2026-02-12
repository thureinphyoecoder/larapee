import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useMemo, useState, useCallback } from "react";
import {
    FaArrowRight,
    FaArrowRightArrowLeft,
    FaBoxOpen,
    FaBoxesStacked,
    FaChartColumn,
    FaClipboardList,
    FaClock,
    FaFloppyDisk,
    FaGear,
    FaLink,
    FaLock,
    FaMagnifyingGlass,
    FaPenToSquare,
    FaSackDollar,
    FaStore,
    FaTag,
    FaTriangleExclamation,
    FaTruckFast,
    FaUser,
} from "react-icons/fa6";
import { sanitizePaginationLabel } from "@/utils/sanitizePaginationLabel";

// ===== CONSTANTS =====
const LOW_STOCK_THRESHOLD = 5;
const FEEDBACK_TIMEOUT = 3000;

// ===== REUSABLE COMPONENTS =====
function MetricCard({ label, value, icon, tone = "slate" }) {
    const toneClasses = {
        slate: "from-slate-600 to-slate-700 border-slate-300",
        red: "from-red-500 to-red-600 border-red-300",
        blue: "from-blue-500 to-blue-600 border-blue-300",
        orange: "from-orange-500 to-orange-600 border-orange-300",
        indigo: "from-indigo-500 to-indigo-600 border-indigo-300",
    };

    return (
        <div
            className={`rounded-2xl p-5 shadow-lg border-2 bg-gradient-to-br text-white ${toneClasses[tone]}`}
        >
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                    {label}
                </p>
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-3xl font-black">{value}</p>
        </div>
    );
}

function FormInput({ label, type = "text", className = "", ...props }) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                    {label}
                </label>
            )}
            <input
                type={type}
                className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                {...props}
            />
        </div>
    );
}

function FormSelect({
    label,
    options,
    className = "",
    colorScheme = "indigo",
    ...props
}) {
    const focusClass = `focus:border-${colorScheme}-500 focus:ring-${colorScheme}-200`;

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                    {label}
                </label>
            )}
            <select
                className={`w-full border-2 border-slate-300 rounded-xl px-4 py-3 focus:ring-2 transition ${focusClass}`}
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

function VariantSelect({
    label,
    value,
    onChange,
    variants,
    placeholder,
    colorScheme = "indigo",
}) {
    const options = [
        { value: "", label: placeholder },
        ...variants.map((v) => ({
            value: v.id,
            label: `${v.product?.shop?.name} | ${v.product?.name} | ${v.sku} (လက်ကျန်: ${v.stock_level})`,
        })),
    ];

    return (
        <FormSelect
            label={label}
            options={options}
            value={value}
            onChange={onChange}
            colorScheme={colorScheme}
        />
    );
}

function ShopSelect({
    label,
    value,
    onChange,
    shops,
    placeholder,
    colorScheme = "indigo",
}) {
    const options = [
        { value: "", label: placeholder },
        ...shops.map((s) => ({ value: s.id, label: s.name })),
    ];

    return (
        <FormSelect
            label={label}
            options={options}
            value={value}
            onChange={onChange}
            colorScheme={colorScheme}
        />
    );
}

function SelectedVariantInfo({ variant, color = "orange" }) {
    if (!variant) return null;

    const colorClasses = {
        orange: "bg-white border-orange-200 text-orange-700",
        blue: "bg-white border-blue-200 text-blue-700",
    };

    return (
        <div
            className={`mb-4 p-4 rounded-xl border-2 shadow-sm ${colorClasses[color]}`}
        >
            <p
                className={`text-xs font-semibold ${color === "orange" ? "text-orange-700" : "text-blue-700"} mb-1`}
            >
                ရွေးချယ်ထားသော SKU
            </p>
            <p className="text-sm font-bold text-slate-800">
                {variant.product?.name}
            </p>
            <p className="text-xs text-slate-600 mt-1">
                SKU: {variant.sku} • လက်ကျန်:{" "}
                <span
                    className={`font-bold ${color === "orange" ? "text-orange-600" : "text-blue-600"}`}
                >
                    {variant.stock_level}
                </span>
            </p>
        </div>
    );
}

function EmptyState({ icon, title, subtitle, colSpan = 6 }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-6 py-16 text-center">
                <div className="text-slate-400">
                    <div className="text-4xl mb-3">{icon}</div>
                    <p className="font-semibold">{title}</p>
                    {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
                </div>
            </td>
        </tr>
    );
}

function StockBadge({ level }) {
    const isLow = level <= LOW_STOCK_THRESHOLD;
    return (
        <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${
                isLow
                    ? "bg-red-100 text-red-700 border-2 border-red-200"
                    : "bg-emerald-100 text-emerald-700 border-2 border-emerald-200"
            }`}
        >
            {level}
        </span>
    );
}

// ===== MAIN COMPONENT =====
export default function InventoryIndex({
    variants,
    transfers = [],
    shops = [],
    shares = [],
    canManageShares = false,
    filters = {},
}) {
    const [q, setQ] = useState(filters?.q || "");
    const [selectedShop, setSelectedShop] = useState(
        filters?.shop_id ? String(filters.shop_id) : "",
    );
    const [lowStockOnly, setLowStockOnly] = useState(
        Boolean(filters?.low_stock),
    );
    const [feedback, setFeedback] = useState({ tone: "", message: "" });

    const adjustForm = useForm({
        variant_id: "",
        action: "add",
        quantity: 0,
        note: "",
    });
    const transferForm = useForm({
        variant_id: "",
        to_shop_id: "",
        quantity: 1,
        note: "",
    });
    const shareForm = useForm({
        from_shop_id: "",
        to_shop_id: "",
        is_enabled: true,
    });

    const variantRows = variants?.data || [];

    // ===== COMPUTED VALUES =====
    const stats = useMemo(
        () => ({
            totalVariants: variantRows.length,
            lowStockCount: variantRows.filter(
                (v) => Number(v.stock_level || 0) <= LOW_STOCK_THRESHOLD,
            ).length,
            transferCount: transfers.length,
            shareRules: shares.length,
        }),
        [variantRows, transfers.length, shares.length],
    );

    const selectedAdjustVariant = useMemo(
        () =>
            variantRows.find(
                (v) => String(v.id) === String(adjustForm.data.variant_id),
            ),
        [variantRows, adjustForm.data.variant_id],
    );

    const selectedTransferVariant = useMemo(
        () =>
            variantRows.find(
                (v) => String(v.id) === String(transferForm.data.variant_id),
            ),
        [variantRows, transferForm.data.variant_id],
    );

    // ===== HELPER FUNCTIONS =====
    const showFeedback = useCallback((tone, message) => {
        setFeedback({ tone, message });
        setTimeout(
            () => setFeedback({ tone: "", message: "" }),
            FEEDBACK_TIMEOUT,
        );
    }, []);

    const handleFormSubmit = useCallback(
        (form, route, successMsg, errorMsg, resetFields = []) =>
            (e) => {
                e.preventDefault();
                form.post(route, {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (resetFields.length) form.reset(...resetFields);
                        showFeedback("success", `✓ ${successMsg}`);
                    },
                    onError: () => showFeedback("error", `✗ ${errorMsg}`),
                });
            },
        [showFeedback],
    );

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(
            route("admin.inventory.index"),
            {
                q: q || undefined,
                shop_id: selectedShop || undefined,
                low_stock: lowStockOnly ? 1 : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setQ("");
        setSelectedShop("");
        setLowStockOnly(false);
        router.get(
            route("admin.inventory.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const prefillForm = useCallback((form, variant, extraData = {}) => {
        form.setData({ variant_id: String(variant.id), ...extraData });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // ===== EVENT HANDLERS =====
    const submitAdjust = handleFormSubmit(
        adjustForm,
        route("admin.inventory.adjust"),
        "ကုန်လက်ကျန် ပြင်ဆင်ပြီးပါပြီ",
        "ကုန်လက်ကျန် ပြင်ဆင်ခြင်း မအောင်မြင်ပါ",
        ["quantity", "note"],
    );

    const submitTransfer = handleFormSubmit(
        transferForm,
        route("admin.inventory.transfer"),
        "ဆိုင်ခွဲအကြား ကုန်လွှဲပြောင်းပြီးပါပြီ",
        "ကုန်လွှဲပြောင်းမှု မအောင်မြင်ပါ",
        ["quantity", "note"],
    );

    const submitShare = handleFormSubmit(
        shareForm,
        route("admin.inventory.share"),
        "Share Permission သိမ်းဆည်းပြီးပါပြီ",
        "Share Permission အပ်ဒိတ်မအောင်မြင်ပါ",
    );

    return (
        <AdminLayout header="ကုန်ပစ္စည်းစီမံခန့်ခွဲမှု">
            <Head title="Inventory Management" />

            <div className="space-y-8 pb-8">
                {/* Feedback Alert */}
                {feedback.message && (
                    <div
                        className={`rounded-2xl border-2 px-6 py-4 text-sm font-semibold shadow-lg animate-in slide-in-from-top duration-300 ${
                            feedback.tone === "error"
                                ? "border-rose-300 bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800"
                                : "border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800"
                        }`}
                    >
                        {feedback.message}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        label="စုစုပေါင်း SKU"
                        value={stats.totalVariants}
                        icon={<FaChartColumn />}
                        tone="indigo"
                    />
                    <MetricCard
                        label="လက်ကျန်နည်းနေသော SKU"
                        value={stats.lowStockCount}
                        icon={<FaTriangleExclamation />}
                        tone="red"
                    />
                    <MetricCard
                        label="ယနေ့ လွှဲပြောင်းမှု"
                        value={stats.transferCount}
                        icon={<FaArrowRightArrowLeft />}
                        tone="blue"
                    />
                    <MetricCard
                        label="Share Permission"
                        value={stats.shareRules}
                        icon={<FaLink />}
                        tone="orange"
                    />
                </div>

                {/* Search & Filter */}
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border-2 border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                            <FaMagnifyingGlass className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-lg">
                                ကုန်ပစ္စည်း ရှာဖွေခြင်း
                            </h3>
                            <p className="text-sm text-slate-500">
                                Product အမည်၊ SKU၊ Brand၊ Category (သို့)
                                ဆိုင်ခွဲအမည် ဖြင့် ရှာဖွေနိုင်ပါသည်
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={applyFilters}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
                    >
                        <FormInput
                            label="ရှာမည့်စာသား"
                            placeholder="Product / SKU / Brand / Category"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="lg:col-span-2"
                        />

                        <ShopSelect
                            label="ဆိုင်ခွဲ ရွေးချယ်ရန်"
                            value={selectedShop}
                            onChange={(e) => setSelectedShop(e.target.value)}
                            shops={shops}
                            placeholder="ဆိုင်ခွဲအားလုံး"
                            className="lg:col-span-2"
                        />

                        <div className="lg:col-span-2 space-y-3">
                            <label className="block text-xs font-semibold text-slate-600">
                                စစ်ထုတ်မှု ရွေးချယ်ချက်
                            </label>
                            <label className="inline-flex items-center gap-3 cursor-pointer bg-white border-2 border-slate-300 rounded-xl px-4 py-3 hover:border-indigo-400 transition">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={lowStockOnly}
                                    onChange={(e) =>
                                        setLowStockOnly(e.target.checked)
                                    }
                                />
                                <span className="text-sm font-medium text-slate-700">
                                    <FaTriangleExclamation className="mr-2 inline h-3.5 w-3.5 text-amber-500" />
                                    လက်ကျန်နည်းများသာ ပြရန်
                                </span>
                            </label>
                        </div>

                        <div className="lg:col-span-6 flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex flex-1 items-center justify-center gap-2 md:flex-none px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-xl transition-all duration-200"
                            >
                                <FaMagnifyingGlass className="h-3.5 w-3.5" />
                                ရှာမည်
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex flex-1 items-center justify-center gap-2 md:flex-none px-8 py-3.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-all duration-200"
                            >
                                <FaArrowRightArrowLeft className="h-3.5 w-3.5" />
                                ပြန်ရှင်းမည်
                            </button>
                        </div>
                    </form>
                </div>

                {/* Action Forms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stock Adjustment */}
                    <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-3xl border-2 border-orange-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                <FaPenToSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">
                                    လက်ကျန် ပြင်ဆင်ခြင်း
                                </h3>
                                <p className="text-xs text-slate-600">
                                    SKU အလိုက် ထည့်/လျှော့/သတ်မှတ် ပြုလုပ်ရန်
                                </p>
                            </div>
                        </div>

                        <SelectedVariantInfo
                            variant={selectedAdjustVariant}
                            color="orange"
                        />

                        <form onSubmit={submitAdjust} className="space-y-4">
                            <VariantSelect
                                label="SKU ရွေးချယ်ပါ"
                                value={adjustForm.data.variant_id}
                                onChange={(e) =>
                                    adjustForm.setData(
                                        "variant_id",
                                        e.target.value,
                                    )
                                }
                                variants={variantRows}
                                placeholder="SKU ရွေးချယ်ပါ..."
                                colorScheme="orange"
                            />

                            <div className="grid grid-cols-3 gap-3">
                                <FormSelect
                                    label="လုပ်ဆောင်ချက်"
                                    value={adjustForm.data.action}
                                    onChange={(e) =>
                                        adjustForm.setData(
                                            "action",
                                            e.target.value,
                                        )
                                    }
                                    options={[
                                        { value: "add", label: "ထည့်" },
                                        { value: "remove", label: "လျှော့" },
                                        { value: "set", label: "သတ်မှတ်" },
                                    ]}
                                    colorScheme="orange"
                                />
                                <FormInput
                                    label="အရေအတွက်"
                                    type="number"
                                    min="0"
                                    value={adjustForm.data.quantity}
                                    onChange={(e) =>
                                        adjustForm.setData(
                                            "quantity",
                                            Number(e.target.value),
                                        )
                                    }
                                    required
                                />
                                <div className="flex items-end">
                                    <button className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold py-3 shadow-lg shadow-orange-200 transition-all duration-200">
                                        <FaFloppyDisk className="h-3.5 w-3.5" />
                                        သိမ်း
                                    </button>
                                </div>
                            </div>

                            <FormInput
                                label="မှတ်ချက် (ရွေးချယ်ရန်)"
                                placeholder="မှတ်ချက်ရေးရန်..."
                                value={adjustForm.data.note}
                                onChange={(e) =>
                                    adjustForm.setData("note", e.target.value)
                                }
                            />
                        </form>
                    </div>

                    {/* Transfer Form */}
                    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl border-2 border-blue-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <FaArrowRightArrowLeft className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">
                                    ဆိုင်ခွဲအကြား လွှဲပြောင်းခြင်း
                                </h3>
                                <p className="text-xs text-slate-600">
                                    တစ်ဆိုင်ခွဲမှ အခြားဆိုင်ခွဲသို့ ကုန်ပစ္စည်း
                                    ရွှေ့ရန်
                                </p>
                            </div>
                        </div>

                        <SelectedVariantInfo
                            variant={selectedTransferVariant}
                            color="blue"
                        />

                        <form onSubmit={submitTransfer} className="space-y-4">
                            <VariantSelect
                                label="မူလ SKU ရွေးချယ်ပါ"
                                value={transferForm.data.variant_id}
                                onChange={(e) =>
                                    transferForm.setData(
                                        "variant_id",
                                        e.target.value,
                                    )
                                }
                                variants={variantRows}
                                placeholder="မူလ SKU ရွေးချယ်ပါ..."
                                colorScheme="blue"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <ShopSelect
                                    label="လွှဲပို့မည့် ဆိုင်ခွဲ"
                                    value={transferForm.data.to_shop_id}
                                    onChange={(e) =>
                                        transferForm.setData(
                                            "to_shop_id",
                                            e.target.value,
                                        )
                                    }
                                    shops={shops}
                                    placeholder="ဆိုင်ရွေးပါ..."
                                    colorScheme="blue"
                                />
                                <FormInput
                                    label="အရေအတွက်"
                                    type="number"
                                    min="1"
                                    value={transferForm.data.quantity}
                                    onChange={(e) =>
                                        transferForm.setData(
                                            "quantity",
                                            Number(e.target.value),
                                        )
                                    }
                                    required
                                />
                            </div>

                            <FormInput
                                label="မှတ်ချက် (ရွေးချယ်ရန်)"
                                placeholder="လွှဲပြောင်းမှု အကြောင်းအရာ..."
                                value={transferForm.data.note}
                                onChange={(e) =>
                                    transferForm.setData("note", e.target.value)
                                }
                            />

                            <button className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-blue-200 transition-all duration-200">
                                <FaTruckFast className="h-4 w-4" />
                                လွှဲပြောင်းမည်
                            </button>
                        </form>
                    </div>
                </div>

                {/* Share Permission */}
                {canManageShares && (
                    <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl border-2 border-purple-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                <FaLock className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">
                                    Share Permission စီမံခန့်ခွဲမှု
                                </h3>
                                <p className="text-xs text-slate-600">
                                    ဆိုင်ခွဲများအကြား Stock မျှဝေခွင့် ပေးရန်
                                    (Admin သာ)
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={submitShare}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
                        >
                            <ShopSelect
                                label="မူလ ဆိုင်ခွဲ"
                                value={shareForm.data.from_shop_id}
                                onChange={(e) =>
                                    shareForm.setData(
                                        "from_shop_id",
                                        e.target.value,
                                    )
                                }
                                shops={shops}
                                placeholder="မူလ ဆိုင်"
                                colorScheme="purple"
                            />
                            <ShopSelect
                                label="ပန်းတိုင် ဆိုင်ခွဲ"
                                value={shareForm.data.to_shop_id}
                                onChange={(e) =>
                                    shareForm.setData(
                                        "to_shop_id",
                                        e.target.value,
                                    )
                                }
                                shops={shops}
                                placeholder="ပန်းတိုင် ဆိုင်"
                                colorScheme="purple"
                            />
                            <FormSelect
                                label="အခြေအနေ"
                                value={shareForm.data.is_enabled ? "1" : "0"}
                                onChange={(e) =>
                                    shareForm.setData(
                                        "is_enabled",
                                        e.target.value === "1",
                                    )
                                }
                                options={[
                                    { value: "1", label: "ဖွင့်ထား" },
                                    { value: "0", label: "ပိတ်ထား" },
                                ]}
                                colorScheme="purple"
                            />
                            <div className="flex items-end">
                                <button className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-bold py-3 shadow-lg shadow-purple-200 transition-all duration-200">
                                    <FaFloppyDisk className="h-3.5 w-3.5" />
                                    သိမ်း
                                </button>
                            </div>
                        </form>

                        {shares.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-3">
                                    လက်ရှိ Permissions
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {shares.map((share) => (
                                        <div
                                            key={share.id}
                                            className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-white hover:border-purple-300 transition"
                                        >
                                            <p className="text-sm font-semibold text-slate-800">
                                                {share.from_shop?.name}{" "}
                                                <span className="text-purple-500 mx-1">
                                                    →
                                                </span>{" "}
                                                {share.to_shop?.name}
                                            </p>
                                            <span
                                                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                                                    share.is_enabled
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {share.is_enabled
                                                    ? "ဖွင့်ထား"
                                                    : "ပိတ်ထား"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Inventory Table */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                        <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                            <FaClipboardList className="h-4 w-4" /> လက်ရှိ ကုန်လက်ကျန် စာရင်း
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                            ပြင်ဆင် (သို့) လွှဲပြောင်း ခလုတ်များကို နှိပ်၍
                            အပေါ်ရှိ Form များတွင် အလိုအလျောက်
                            ဖြည့်သွင်းပေးပါမည်
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr className="text-left text-slate-600 font-bold text-xs border-b-2 border-slate-200">
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaStore className="h-3 w-3" />
                                            ဆိုင်ခွဲ
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaBoxOpen className="h-3 w-3" />
                                            ကုန်ပစ္စည်း
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaTag className="h-3 w-3" />
                                            SKU
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaSackDollar className="h-3 w-3" />
                                            ဈေးနှုန်း
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaChartColumn className="h-3 w-3" />
                                            လက်ကျန်
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaGear className="h-3 w-3" />
                                            လုပ်ဆောင်ချက်
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {variantRows.length > 0 ? (
                                    variantRows.map((variant) => (
                                        <tr
                                            key={variant.id}
                                            className="hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-transparent transition-all duration-200"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {variant.product?.shop?.name ||
                                                    "—"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-800">
                                                {variant.product?.name || "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                    {variant.sku || "—"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-700">
                                                {Number(
                                                    variant.price || 0,
                                                ).toLocaleString()}{" "}
                                                <span className="text-xs text-slate-500">
                                                    MMK
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StockBadge
                                                    level={variant.stock_level}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            prefillForm(
                                                                adjustForm,
                                                                variant,
                                                                {
                                                                    quantity: 1,
                                                                    action: "add",
                                                                },
                                                            )
                                                        }
                                                        className="px-3 py-2 text-xs font-semibold rounded-lg border-2 border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 transition-all duration-200"
                                                    >
                                                        <span className="inline-flex items-center gap-1">
                                                            <FaPenToSquare className="h-3 w-3" />
                                                            ပြင်ဆင်
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            prefillForm(
                                                                transferForm,
                                                                variant,
                                                                { quantity: 1 },
                                                            )
                                                        }
                                                        className="px-3 py-2 text-xs font-semibold rounded-lg border-2 border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
                                                    >
                                                        <span className="inline-flex items-center gap-1">
                                                            <FaArrowRightArrowLeft className="h-3 w-3" />
                                                            လွှဲပြောင်း
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState
                                        icon={<FaBoxesStacked />}
                                        title="ကုန်ပစ္စည်း မရှိသေးပါ"
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {variants?.links?.length > 1 && (
                        <div className="p-5 flex flex-wrap gap-2 border-t-2 border-slate-100 bg-slate-50">
                            {variants.links.map((link, idx) => (
                                <Link
                                    key={`${link.label}-${idx}`}
                                    href={link.url || "#"}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                                        link.active
                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg"
                                            : "bg-white text-slate-600 border-slate-300 hover:border-orange-400 hover:bg-orange-50"
                                    } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
                                >
                                    {sanitizePaginationLabel(link.label)}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Transfer History */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-slate-200">
                        <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                            <FaClipboardList className="h-4 w-4" /> လွှဲပြောင်းမှု မှတ်တမ်း
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                            လတ်တလော လုပ်ဆောင်ခဲ့သော ကုန်လွှဲပြောင်းမှုများ
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr className="text-left text-slate-600 font-bold text-xs border-b-2 border-slate-200">
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaClock className="h-3 w-3" />
                                            အချိန်
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaStore className="h-3 w-3" />
                                            မူလဆိုင်
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaArrowRight className="h-3 w-3" />
                                            ပန်းတိုင်ဆိုင်
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaTag className="h-3 w-3" />
                                            SKU
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaChartColumn className="h-3 w-3" />
                                            အရေအတွက်
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaUser className="h-3 w-3" />
                                            လုပ်ဆောင်သူ
                                        </span>
                                    </th>
                                    <th className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            <FaGear className="h-3 w-3" />
                                            အခြေအနေ
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transfers.length > 0 ? (
                                    transfers.map((transfer) => (
                                        <tr
                                            key={transfer.id}
                                            className="hover:bg-blue-50/30 transition-all duration-200"
                                        >
                                            <td className="px-6 py-4 text-slate-600 text-xs">
                                                {new Date(
                                                    transfer.created_at,
                                                ).toLocaleString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {transfer.from_shop?.name ||
                                                    "—"}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {transfer.to_shop?.name || "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                    {transfer.source_variant
                                                        ?.sku || "—"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-blue-600">
                                                {transfer.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {transfer.initiator?.name ||
                                                    "System"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700 border-2 border-emerald-200">
                                                    {transfer.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState
                                        icon={<FaClipboardList />}
                                        title="မှတ်တမ်း မရှိသေးပါ"
                                        subtitle="ကုန်လွှဲပြောင်းမှု မရှိသေးပါ"
                                        colSpan={7}
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
