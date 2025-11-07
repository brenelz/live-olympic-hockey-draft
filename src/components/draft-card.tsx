import { Link } from "@tanstack/solid-router";
import type { fetchUserDrafts } from "~/lib/server";
import { formatDate } from "~/lib/utils";

type Draft = NonNullable<
    Awaited<ReturnType<typeof fetchUserDrafts>>
>[number];

export type DraftCardProps = {
    draft: Draft;
};

export default function DraftCard(props: DraftCardProps) {
    const status = props.draft?.status;
    const route =
        status === "DURING"
            ? "/draft/$id/during"
            : status === "POST"
                ? "/draft/$id/post"
                : "/draft/$id/pre";

    const getStatusStyles = () => {
        switch (status) {
            case "PRE":
                return {
                    bgClass: "from-yellow-900/30 to-orange-900/30",
                    borderClass: "border-yellow-600/30 hover:border-yellow-600/50",
                    badgeClass: "bg-yellow-600/20 border-yellow-600/30 text-yellow-300",
                    badgeText: "PRE-DRAFT",
                };
            case "DURING":
                return {
                    bgClass: "from-red-900/30 to-pink-900/30",
                    borderClass: "border-red-600/30 hover:border-red-600/50",
                    badgeClass:
                        "bg-red-600/20 border-red-600/30 text-red-300 animate-pulse",
                    badgeText: "LIVE",
                };
            case "POST":
                return {
                    bgClass: "from-green-900/30 to-emerald-900/30",
                    borderClass: "border-green-600/30 hover:border-green-600/50",
                    badgeClass: "bg-green-600/20 border-green-600/30 text-green-300",
                    badgeText: "COMPLETE",
                };
            default:
                return {
                    bgClass: "from-slate-700/30 to-slate-800/30",
                    borderClass: "border-slate-600 hover:border-slate-500",
                    badgeClass: "bg-slate-600/20 border-slate-600/30 text-slate-300",
                    badgeText: "UNKNOWN",
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <Link to={route} params={{ id: props.draft?._id ?? "" }}>
            <div
                class={`cursor-pointer p-6 bg-gradient-to-r ${styles.bgClass} rounded-xl border-2 ${styles.borderClass} transition-all hover:shadow-md mb-4`}
            >
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <span
                            class={`px-4 py-2 ${styles.badgeClass} text-sm font-medium rounded-lg border`}
                        >
                            {styles.badgeText}
                        </span>
                        <h4 class="text-lg font-bold text-white">{props.draft?.name}</h4>
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
                    <span>📅 {formatDate(props.draft?.startDatetime ?? 0)}</span>
                    <span>•</span>
                    <span>
                        👥 {props.draft?.teamCount}{" "}
                        {props.draft?.teamCount === 1 ? "team" : "teams"}
                    </span>
                    {props.draft?.userTeamName && (
                        <>
                            <span>•</span>
                            <span>🏆 {props.draft?.userTeamName}</span>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}

