import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

export default function SupportInbox({
    conversations = [],
    messages = [],
    activeCustomerId = 0,
}) {
    const { auth } = usePage().props;
    const userId = auth?.user?.id;
    const listRef = useRef(null);
    const lastMessageIdRef = useRef(null);
    const [showJumpToLatest, setShowJumpToLatest] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        message: "",
        customer_id: activeCustomerId || "",
    });

    const scrollToBottom = (behavior = "smooth") => {
        if (!listRef.current) return;
        listRef.current.scrollTo({
            top: listRef.current.scrollHeight,
            behavior,
        });
        setShowJumpToLatest(false);
    };

    useEffect(() => {
        setData("customer_id", activeCustomerId || "");
    }, [activeCustomerId]);

    useEffect(() => {
        if (!window.Echo || !userId) return;

        const privateChannel = `user.${userId}`;
        window.Echo.private(privateChannel).listen(".SupportMessageSent", () => {
            router.reload({ only: ["conversations", "messages", "activeCustomerId"] });
        });
        window.Echo.private(privateChannel).listen(".SupportMessageSeen", () => {
            router.reload({ only: ["messages"] });
        });

        window.Echo.channel("admin-notifications").listen(".SupportMessageSent", () => {
            router.reload({ only: ["conversations", "messages", "activeCustomerId"] });
        });

        return () => {
            window.Echo.leaveChannel(privateChannel);
            window.Echo.leaveChannel("admin-notifications");
        };
    }, [userId, activeCustomerId]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("support:clear-notifications"));
    }, [activeCustomerId]);

    useEffect(() => {
        lastMessageIdRef.current = null;
        setShowJumpToLatest(false);
    }, [activeCustomerId]);

    useEffect(() => {
        const currentLastId = messages.length ? messages[messages.length - 1].id : null;
        const previousLastId = lastMessageIdRef.current;
        const hasNewMessage = previousLastId !== null && currentLastId !== previousLastId;

        if (!listRef.current) {
            lastMessageIdRef.current = currentLastId;
            return;
        }

        const listEl = listRef.current;
        const distanceFromBottom = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight;
        const isNearBottom = distanceFromBottom <= 96;

        if (previousLastId === null || isNearBottom || !hasNewMessage) {
            requestAnimationFrame(() => scrollToBottom("auto"));
        } else {
            setShowJumpToLatest(true);
        }

        lastMessageIdRef.current = currentLastId;
    }, [messages, activeCustomerId]);

    const handleListScroll = () => {
        if (!listRef.current) return;
        const listEl = listRef.current;
        const distanceFromBottom = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight;
        setShowJumpToLatest(distanceFromBottom > 96);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.support.store"), {
            preserveScroll: true,
            onSuccess: () => reset("message"),
        });
    };

    return (
        <AdminLayout header="Support Inbox">
            <Head title="Support Inbox" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">Customers</h3>
                    </div>
                    <div className="max-h-[620px] overflow-y-auto">
                        {conversations.length ? (
                            conversations.map((c) => (
                                <Link
                                    key={c.customer_id}
                                    href={route("admin.support.index", {
                                        customer: c.customer_id,
                                    })}
                                    className={`block px-4 py-3 border-b border-slate-50 ${
                                        Number(activeCustomerId) === Number(c.customer_id)
                                            ? "bg-orange-50"
                                            : "hover:bg-slate-50"
                                    }`}
                                >
                                    <p className="font-semibold text-slate-700 text-sm">
                                        {c.customer_name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 truncate">
                                        {c.last_message}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {c.last_time}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="p-6 text-center text-sm text-slate-400">
                                No support conversations yet.
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-4 h-[680px] flex flex-col relative">
                    <div className="pb-3 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">
                            {activeCustomerId ? `Conversation #${activeCustomerId}` : "Select customer"}
                        </h3>
                    </div>

                    <div
                        ref={listRef}
                        onScroll={handleListScroll}
                        className="flex-1 overflow-y-auto space-y-3 p-2 mt-2"
                    >
                        {messages.length ? (
                            messages.map((m) => {
                                const mine = m.sender_id === userId;
                                return (
                                    <div
                                        key={m.id}
                                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                                                mine
                                                    ? "bg-sky-600 text-white"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            <p>{m.message}</p>
                                            <p
                                                className={`mt-1 text-[10px] ${
                                                    mine ? "text-white/80" : "text-slate-400"
                                                }`}
                                            >
                                                {m.sender?.name || "User"} -{" "}
                                                {new Date(m.created_at).toLocaleString()}
                                                {mine ? ` • ${m.seen_at ? "Seen" : "Sent"}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                No messages.
                            </div>
                        )}
                    </div>

                    {showJumpToLatest && (
                        <button
                            type="button"
                            onClick={() => scrollToBottom("smooth")}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-lg"
                        >
                            New messages ↓
                        </button>
                    )}

                    <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-100">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={data.message}
                                onChange={(e) => setData("message", e.target.value)}
                                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                placeholder="Reply to customer..."
                                disabled={!activeCustomerId}
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.message.trim() || !activeCustomerId}
                                className={`px-5 rounded-xl text-sm font-bold ${
                                    processing || !data.message.trim() || !activeCustomerId
                                        ? "bg-slate-300 text-slate-500"
                                        : "bg-sky-600 text-white hover:bg-sky-700"
                                }`}
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
