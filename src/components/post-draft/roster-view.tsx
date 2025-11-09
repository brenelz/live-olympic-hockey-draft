import { ClientOnly } from "@tanstack/solid-router";
import type { Id } from "convex/_generated/dataModel";
import { For, Show, createMemo, createSignal, type Accessor } from "solid-js";

type Player = {
    name: string;
    avatar?: string;
    position: string;
    pickNum: number;
};

type Team = {
    teamId: Id<"draftTeams">;
    teamName: string;
    betterAuthUserId: string;
    forwards: Player[];
    defense: Player[];
    goalies: Player[];
};

type RosterViewProps = {
    teamsWithRosters?: Team[];
    userId?: string;
    selectedTeamId: Id<"draftTeams"> | null;
};

export function RosterView(props: RosterViewProps) {
    const selectedTeam = createMemo(() => {
        const teams = props.teamsWithRosters;
        if (!teams) return null;
        return teams.find((t) => t.teamId === props.selectedTeamId) || teams[0] || null;
    });

    const isUserTeam = (team: Team) =>
        props.userId && team.betterAuthUserId === props.userId;

    return (
        <Show
            when={selectedTeam()}
            fallback={
                <div class="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                    <p class="text-slate-400">Select a team to view roster</p>
                </div>
            }
        >
            {(team) => {
                return (
                    <div class="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <h2 class="text-2xl font-bold text-white">
                                {team().teamName} Roster
                            </h2>
                            <ClientOnly>
                                <Show when={isUserTeam(team())}>
                                    <span class="px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                                        Your Team
                                    </span>
                                </Show>
                            </ClientOnly>
                        </div>

                        {/* Forwards */}
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Forwards ({team().forwards.length})
                            </h3>
                            <Show
                                when={team().forwards.length > 0}
                                fallback={
                                    <p class="text-slate-400 text-sm">
                                        No forwards selected
                                    </p>
                                }
                            >
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <For each={team().forwards}>
                                        {(player) => {
                                            const [imageError, setImageError] = createSignal(false);
                                            return (
                                                <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                                                    <div class="flex items-center gap-3">
                                                        <Show
                                                            when={player.avatar && !imageError()}
                                                            fallback={
                                                                <div class="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                                    {player.name.charAt(0)}
                                                                </div>
                                                            }
                                                        >
                                                            <img
                                                                src={player.avatar}
                                                                alt={player.name}
                                                                class="w-12 h-12 rounded-full object-cover border-2 border-slate-600 flex-shrink-0"
                                                                onError={() => setImageError(true)}
                                                            />
                                                        </Show>
                                                        <div class="flex-1 min-w-0">
                                                            <div class="flex justify-between items-start mb-1">
                                                                <p class="text-white font-semibold truncate">
                                                                    {player.name}
                                                                </p>
                                                                <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded ml-2 flex-shrink-0">
                                                                    #{player.pickNum}
                                                                </span>
                                                            </div>
                                                            <p class="text-slate-400 text-sm">
                                                                {player.position}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    </For>
                                </div>
                            </Show>
                        </div>

                        {/* Defense */}
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                Defense ({team().defense.length})
                            </h3>
                            <Show
                                when={team().defense.length > 0}
                                fallback={
                                    <p class="text-slate-400 text-sm">
                                        No defensemen selected
                                    </p>
                                }
                            >
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <For each={team().defense}>
                                        {(player) => {
                                            const [imageError, setImageError] = createSignal(false);
                                            return (
                                                <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                                                    <div class="flex items-center gap-3">
                                                        <Show
                                                            when={player.avatar && !imageError()}
                                                            fallback={
                                                                <div class="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                                    {player.name.charAt(0)}
                                                                </div>
                                                            }
                                                        >
                                                            <img
                                                                src={player.avatar}
                                                                alt={player.name}
                                                                class="w-12 h-12 rounded-full object-cover border-2 border-slate-600 flex-shrink-0"
                                                                onError={() => setImageError(true)}
                                                            />
                                                        </Show>
                                                        <div class="flex-1 min-w-0">
                                                            <div class="flex justify-between items-start mb-1">
                                                                <p class="text-white font-semibold truncate">
                                                                    {player.name}
                                                                </p>
                                                                <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded ml-2 flex-shrink-0">
                                                                    #{player.pickNum}
                                                                </span>
                                                            </div>
                                                            <p class="text-slate-400 text-sm">
                                                                {player.position}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    </For>
                                </div>
                            </Show>
                        </div>

                        {/* Goalies */}
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                                Goalies ({team().goalies.length})
                            </h3>
                            <Show
                                when={team().goalies.length > 0}
                                fallback={
                                    <p class="text-slate-400 text-sm">
                                        No goalies selected
                                    </p>
                                }
                            >
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <For each={team().goalies}>
                                        {(player) => {
                                            const [imageError, setImageError] = createSignal(false);
                                            return (
                                                <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                                                    <div class="flex items-center gap-3">
                                                        <Show
                                                            when={player.avatar && !imageError()}
                                                            fallback={
                                                                <div class="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                                    {player.name.charAt(0)}
                                                                </div>
                                                            }
                                                        >
                                                            <img
                                                                src={player.avatar}
                                                                alt={player.name}
                                                                class="w-12 h-12 rounded-full object-cover border-2 border-slate-600 flex-shrink-0"
                                                                onError={() => setImageError(true)}
                                                            />
                                                        </Show>
                                                        <div class="flex-1 min-w-0">
                                                            <div class="flex justify-between items-start mb-1">
                                                                <p class="text-white font-semibold truncate">
                                                                    {player.name}
                                                                </p>
                                                                <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded ml-2 flex-shrink-0">
                                                                    #{player.pickNum}
                                                                </span>
                                                            </div>
                                                            <p class="text-slate-400 text-sm">
                                                                {player.position}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    </For>
                                </div>
                            </Show>
                        </div>
                    </div>
                );
            }}
        </Show>
    );
}

