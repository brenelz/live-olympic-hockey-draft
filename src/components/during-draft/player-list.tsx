import { For, Show } from "solid-js";
import type { Accessor } from "solid-js";
import type { Id } from "convex/_generated/dataModel";

interface Player {
    _id: Id<"draftablePlayers">;
    name: string;
    position: string;
    avatar?: string;
}

interface PlayerListProps {
    players: Accessor<Player[]>;
    selectedPlayer: Accessor<Id<"draftablePlayers"> | null>;
    onSelectPlayer: (playerId: Id<"draftablePlayers">) => void;
    isMakingPick: Accessor<boolean>;
}

export function PlayerList(props: PlayerListProps) {
    return (
        <div class="space-y-2 max-h-[600px] overflow-y-auto">
            <Show
                when={props.players().length > 0}
                fallback={
                    <div class="text-center py-8 text-slate-400">
                        <p>No available players found</p>
                    </div>
                }
            >
                <For each={props.players()}>
                    {(player) => (
                        <button
                            onClick={() => props.onSelectPlayer(player._id)}
                            disabled={props.isMakingPick()}
                            class={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${props.selectedPlayer() === player._id
                                    ? "bg-blue-600/20 border-blue-500"
                                    : "bg-slate-900/50 border-slate-600 hover:bg-slate-900/80"
                                } ${props.isMakingPick()
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                        >
                            <div class="flex items-center gap-4">
                                <div
                                    class={`w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold ${player.avatar ? "hidden" : ""
                                        }`}
                                >
                                    {player.name.charAt(0)}
                                </div>
                                <div class="text-left">
                                    <p class="text-white font-semibold">{player.name}</p>
                                    <p class="text-slate-400 text-sm">{player.position}</p>
                                </div>
                            </div>
                            {props.selectedPlayer() === player._id && (
                                <span class="text-blue-400">✓</span>
                            )}
                        </button>
                    )}
                </For>
            </Show>
        </div>
    );
}

