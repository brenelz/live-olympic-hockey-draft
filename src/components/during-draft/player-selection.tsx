import { Show } from "solid-js";
import type { Accessor } from "solid-js";
import type { Id } from "convex/_generated/dataModel";
import { PlayerSearch } from "./player-search";
import { PlayerList } from "./player-list";
import { WaitingMessage } from "./waiting-message";

interface Player {
    _id: Id<"draftablePlayers">;
    name: string;
    position: string;
    avatar?: string;
}

interface PlayerSelectionProps {
    isMyTurn: boolean;
    searchQuery: () => string;
    onSearchInput: (value: string) => void;
    filteredPlayers: Accessor<Player[]>;
    selectedPlayer: Accessor<Id<"draftablePlayers"> | null>;
    onSelectPlayer: (playerId: Id<"draftablePlayers">) => void;
    isMakingPick: Accessor<boolean>;
    onMakePick: () => void;
}

export function PlayerSelection(props: PlayerSelectionProps) {
    return (
        <Show
            when={props.isMyTurn}
            fallback={<WaitingMessage />}
        >
            <div class="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                <h2 class="text-2xl font-bold text-white mb-4">Available Players</h2>

                <PlayerSearch
                    searchQuery={props.searchQuery}
                    onInput={props.onSearchInput}
                />

                <PlayerList
                    players={props.filteredPlayers}
                    selectedPlayer={props.selectedPlayer}
                    onSelectPlayer={props.onSelectPlayer}
                    isMakingPick={props.isMakingPick}
                />

                <button
                    onClick={props.onMakePick}
                    disabled={!props.selectedPlayer() || props.isMakingPick()}
                    class="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-lg"
                >
                    {props.isMakingPick()
                        ? "Making Pick..."
                        : props.selectedPlayer()
                            ? "Confirm Pick"
                            : "Select a Player"}
                </button>
            </div>
        </Show>
    );
}

