import { Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import type { fetchUserDrafts } from "~/lib/server";
import { Button } from "~/components/ui/button";

export type YourDraftsProps = {
    drafts: Awaited<ReturnType<typeof fetchUserDrafts>>;
};

export default function YourDrafts(props: YourDraftsProps) {
    const statusConfig = (status: string | undefined) => {
        switch (status) {
            case "PRE":
                return {
                    route: "/draft/$id/pre" as const,
                    bgClass: "from-yellow-900/30 to-orange-900/30",
                    borderClass: "border-yellow-600/30 hover:border-yellow-600/50",
                    badgeClass: "bg-yellow-600/20 border-yellow-600/30 text-yellow-300",
                    badgeText: "PRE-DRAFT",
                };
            case "DURING":
                return {
                    route: "/draft/$id/during" as const,
                    bgClass: "from-red-900/30 to-pink-900/30",
                    borderClass: "border-red-600/30 hover:border-red-600/50",
                    badgeClass:
                        "bg-red-600/20 border-red-600/30 text-red-300 animate-pulse",
                    badgeText: "LIVE",
                };
            case "POST":
                return {
                    route: "/draft/$id/post" as const,
                    bgClass: "from-green-900/30 to-emerald-900/30",
                    borderClass: "border-green-600/30 hover:border-green-600/50",
                    badgeClass: "bg-green-600/20 border-green-600/30 text-green-300",
                    badgeText: "COMPLETE",
                };
            default:
                return {
                    route: "/draft/$id/pre" as const,
                    bgClass: "from-slate-700/30 to-slate-800/30",
                    borderClass: "border-slate-600 hover:border-slate-500",
                    badgeClass: "bg-slate-600/20 border-slate-600/30 text-slate-300",
                    badgeText: "UNKNOWN",
                };
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
            <h3 class="text-2xl font-bold text-white mb-6">Your Drafts</h3>

            <Show when={props.drafts} fallback={<div class="text-slate-400">Loading...</div>}>
                <Show
                    when={props.drafts && props.drafts.length > 0}
                    fallback={
                        <div class="text-center py-12 text-slate-400">
                            <svg
                                class="w-20 h-20 mx-auto mb-4 text-slate-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            <p class="text-xl font-medium mb-2 text-white">No drafts yet</p>
                            <p class="text-sm mb-6">
                                Create a new draft or join an existing one to get started!
                            </p>
                            <div class="flex justify-center gap-3">
                                <Link to="/draft/create">
                                    <Button class="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                        Create New Draft
                                    </Button>
                                </Link>
                                <Link to="/draft/join" search={{ id: "" }}>
                                    <Button
                                        variant="outline"
                                        class="cursor-pointer border-slate-600 text-white hover:bg-slate-700"
                                    >
                                        Join Draft
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    }
                >
                    <div class="space-y-4">
                        <For each={props.drafts ?? []}>
                            {(draft) => {
                                const config = statusConfig(draft?.status);
                                return (
                                    <Link to={config.route} params={{ id: draft?._id ?? "" }}>
                                        <div
                                            class={`cursor-pointer p-6 bg-gradient-to-r ${config.bgClass} rounded-xl border-2 ${config.borderClass} transition-all cursor-pointer hover:shadow-md mb-4`}
                                        >
                                            <div class="flex items-center justify-between mb-3">
                                                <div class="flex items-center gap-3">
                                                    <span
                                                        class={`px-4 py-2 ${config.badgeClass} text-sm font-medium rounded-lg border`}
                                                    >
                                                        {config.badgeText}
                                                    </span>
                                                    <h4 class="text-lg font-bold text-white">
                                                        {draft?.name}
                                                    </h4>
                                                </div>
                                                <svg
                                                    class="w-5 h-5 text-slate-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </div>
                                            <div class="flex items-center gap-4 text-sm text-slate-300">
                                                <span>
                                                    📅 {formatDate(draft?.startDatetime ?? 0)}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    👥 {draft?.teamCount}{" "}
                                                    {draft?.teamCount === 1 ? "team" : "teams"}
                                                </span>
                                                {draft?.userTeamName && (
                                                    <>
                                                        <span>•</span>
                                                        <span>🏆 {draft?.userTeamName}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }}
                        </For>
                    </div>
                </Show>
            </Show>
        </div>
    );
}

