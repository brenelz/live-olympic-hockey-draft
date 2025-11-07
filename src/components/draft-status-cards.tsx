import type { fetchUserDrafts } from "~/lib/server";
import { DraftStatusCard } from "./draft-status-card";

export type DraftStatusCardsProps = {
    drafts: Awaited<ReturnType<typeof fetchUserDrafts>>
};

export default function DraftStatusCards(props: DraftStatusCardsProps) {
    return (
        <div class="grid md:grid-cols-3 gap-6">
            <DraftStatusCard
                title="Pre-Draft"
                count={
                    props.drafts.filter((d) => d?.status === "PRE")
                        .length ?? 0
                }
                description={
                    (props.drafts.filter((d) => d?.status === "PRE")
                        .length ?? 0) === 0
                        ? "No upcoming drafts"
                        : "Waiting to start"
                }
                icon={
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                }
                iconBgClass="bg-yellow-600/20"
                iconBorderClass="border-yellow-600/30"
                iconColorClass="text-yellow-400"
            />

            <DraftStatusCard
                title="Live Drafts"
                count={
                    props.drafts.filter((d) => d?.status === "DURING")
                        .length ?? 0
                }
                description={
                    (props.drafts.filter((d) => d?.status === "DURING")
                        .length ?? 0) === 0
                        ? "No active drafts"
                        : "In progress"
                }
                icon={
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                }
                iconBgClass="bg-red-600/20"
                iconBorderClass="border-red-600/30"
                iconColorClass="text-red-400"
            />

            <DraftStatusCard
                title="Completed"
                count={
                    props.drafts.filter((d) => d?.status === "POST")
                        .length ?? 0
                }
                description={
                    (props.drafts.filter((d) => d?.status === "POST")
                        .length ?? 0) === 0
                        ? "No completed drafts"
                        : "Drafts finished"
                }
                icon={
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                }
                iconBgClass="bg-green-600/20"
                iconBorderClass="border-green-600/30"
                iconColorClass="text-green-400"
            />
        </div>
    );
}