import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

export default function SupportChat({ messages = [], assignedStaff = null }) {
    const { auth } = usePage().props;
    const userId = auth?.user?.id;
    const listRef = useRef(null);
    const lastMessageIdRef = useRef(null);
    const [showJumpToLatest, setShowJumpToLatest] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        message: "",
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
        if (!window.Echo || !userId) return;

        const channel = `user.${userId}`;
        window.Echo.private(channel).listen(".SupportMessageSent", (e) => {
            if (Number(e?.sender_id) === Number(userId)) {
                return;
            }

            router.reload({ only: ["messages", "assignedStaff"] });
        });

        window.Echo.private(channel).listen(".SupportMessageSeen", () => {
            router.reload({ only: ["messages"] });
        });

        return () => window.Echo.leaveChannel(channel);
    }, [userId]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("support:clear-notifications"));
    }, []);

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
    }, [messages]);

    const handleListScroll = () => {
        if (!listRef.current) return;
        const listEl = listRef.current;
        const distanceFromBottom = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight;
        setShowJumpToLatest(distanceFromBottom > 96);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("support.store"), {
            preserveScroll: true,
            onSuccess: () => reset("message"),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Support Chat" />

            <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Support
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-slate-800">
                        Need help? Chat with manager
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {assignedStaff
                            ? `Assigned to ${assignedStaff.name}`
                            : "A support staff will reply soon."}
                    </p>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4 h-[520px] flex flex-col relative">
                    <div
                        ref={listRef}
                        onScroll={handleListScroll}
                        className="flex-1 overflow-y-auto space-y-3 p-2"
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
                                                    ? "bg-orange-500 text-white"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            <p>{m.message}</p>
                                            <p
                                                className={`mt-1 text-[10px] ${
                                                    mine ? "text-white/80" : "text-slate-400"
                                                }`}
                                            >
                                                {new Date(m.created_at).toLocaleString()}
                                                {mine ? ` • ${m.seen_at ? "Seen" : "Sent"}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                Start a conversation with support team.
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
                                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Type your message..."
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.message.trim()}
                                className={`px-5 rounded-xl text-sm font-bold ${
                                    processing || !data.message.trim()
                                        ? "bg-slate-300 text-slate-500"
                                        : "bg-orange-600 text-white hover:bg-orange-700"
                                }`}
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
