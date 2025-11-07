import { useQuery } from "convex-solidjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { For, Show } from "solid-js";

interface RecentPicksProps {
    draftId: Id<'drafts'>;
}

export function RecentPicks(props: RecentPicksProps) {
    const { data: recentPicks } = useQuery(api.draftPicks.getRecentPicks, {
        draftId: props.draftId,
        limit: 10,
    });

    return (
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
            <h3 class="text-xl font-bold text-white mb-4">Recent Picks</h3>
            <Show
                when={recentPicks() && recentPicks()!.length > 0}
                fallback={
                    <div class="text-center py-4 text-slate-400 text-sm">
                        No picks yet
                    </div>
                }
            >
                <div class="space-y-3">
                    <For each={recentPicks() || []}>
                        {(pick) => (
                            <div class="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                                <div class="flex items-center justify-between mb-1">
                                    <p class="text-white font-semibold">
                                        {pick.player?.name || "Unknown"}
                                    </p>
                                    <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                        #{pick.pickNumber}
                                    </span>
                                </div>
                                <p class="text-slate-400 text-sm">
                                    {pick.player?.position} • {pick.teamName}
                                </p>
                            </div>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}

