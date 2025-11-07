import { Show } from "solid-js";
import type { Accessor } from "solid-js";

interface DraftHeaderProps {
    draftName: string | undefined;
    currentPickData: Accessor<{
        round: number;
        pickNumber: number;
    } | undefined>;
}

export function DraftHeader(props: DraftHeaderProps) {
    return (
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-1">
                        {props.draftName || "Draft"}
                    </h1>
                    <Show when={props.currentPickData()}>
                        {(pick) => (
                            <p class="text-slate-300">
                                Round {pick().round} • Pick #{pick().pickNumber}
                            </p>
                        )}
                    </Show>
                </div>
                <span class="px-4 py-2 bg-red-600/20 text-red-300 text-sm rounded-lg font-medium border border-red-600/30 animate-pulse">
                    LIVE
                </span>
            </div>
        </div>
    );
}

