import { useQuery } from "convex-solidjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Show } from "solid-js";

interface DraftStats {
    totalPicks: number;
    maxPicks: number;
    currentPick: number;
    forwards: number;
    defense: number;
    goalies: number;
}

interface DraftStatsProps {
    draftId: Id<'drafts'>;
}

export function DraftStats(props: DraftStatsProps) {
    const { data: draftStats } = useQuery(api.draftPicks.getDraftStats, { draftId: props.draftId });

    return (
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
            <h3 class="text-xl font-bold text-white mb-4">Draft Stats</h3>
            <Show
                when={draftStats()}
                fallback={
                    <div class="text-center py-4 text-slate-400 text-sm">
                        Loading stats...
                    </div>
                }
            >
                {(stats) => (
                    <dl class="space-y-2">
                        <div class="flex justify-between">
                            <dt class="text-slate-400">Total Picks:</dt>
                            <dd class="text-white font-semibold">
                                {stats().totalPicks} / {stats().maxPicks}
                            </dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-slate-400">Current Pick:</dt>
                            <dd class="text-white font-semibold">#{stats().currentPick}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-slate-400">Forwards:</dt>
                            <dd class="text-white font-semibold">{stats().forwards}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-slate-400">Defense:</dt>
                            <dd class="text-white font-semibold">{stats().defense}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-slate-400">Goalies:</dt>
                            <dd class="text-white font-semibold">{stats().goalies}</dd>
                        </div>
                    </dl>
                )}
            </Show>
        </div>
    );
}

