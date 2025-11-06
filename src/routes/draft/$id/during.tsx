import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, createSignal } from "solid-js";

export const Route = createFileRoute("/draft/$id/during")({
    component: DuringDraft,
});

function DuringDraft() {
    const { id } = Route.useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = createSignal("");
    const [selectedPlayer, setSelectedPlayer] = createSignal<string | null>(null);

    // Dummy data
    const currentPick = {
        pickNumber: 5,
        round: 1,
        team: "Avalanche",
        owner: "Charlie Brown",
        timeRemaining: 45,
    };

    const availablePlayers = [
        { id: "1", name: "Connor McDavid", position: "C", team: "EDM" },
        { id: "2", name: "Auston Matthews", position: "C", team: "TOR" },
        { id: "3", name: "Nathan MacKinnon", position: "C", team: "COL" },
        { id: "4", name: "Cale Makar", position: "D", team: "COL" },
        { id: "5", name: "Connor Hellebuyck", position: "G", team: "WPG" },
    ];

    const recentPicks = [
        { team: "Lightning", player: "Leon Draisaitl", position: "C" },
        { team: "Penguins", player: "David Pastrnak", position: "RW" },
        { team: "Bruins", player: "Igor Shesterkin", position: "G" },
        { team: "Maple Leafs", player: "Victor Hedman", position: "D" },
    ];

    const makePick = () => {
        if (selectedPlayer()) {
            console.log("Making pick:", selectedPlayer());
            // TODO: Implement pick logic
            setSelectedPlayer(null);
        }
    };

    const finishDraft = () => {
        navigate({ to: "/draft/$id/post", params: { id } });
    };

    return (
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-6">
            <div class="max-w-7xl mx-auto">
                {/* Header with Current Pick Info */}
                <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h1 class="text-3xl font-bold text-white mb-1">
                                2026 Olympics Draft
                            </h1>
                            <p class="text-slate-300">
                                Round {currentPick.round} • Pick #{currentPick.pickNumber}
                            </p>
                        </div>
                        <span class="px-4 py-2 bg-red-600/20 text-red-300 rounded-lg font-medium border border-red-600/30 animate-pulse">
                            LIVE
                        </span>
                    </div>

                    {/* On The Clock */}
                    <div class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-slate-300 mb-1">ON THE CLOCK</p>
                                <p class="text-2xl font-bold text-white">
                                    {currentPick.team}
                                </p>
                                <p class="text-slate-400 text-sm">{currentPick.owner}</p>
                            </div>
                            <div class="text-center">
                                <div class="text-4xl font-bold text-white">
                                    {currentPick.timeRemaining}s
                                </div>
                                <p class="text-slate-400 text-sm">remaining</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Available Players */}
                    <div class="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                        <h2 class="text-2xl font-bold text-white mb-4">
                            Available Players
                        </h2>

                        {/* Search */}
                        <div class="mb-4">
                            <input
                                type="text"
                                value={searchQuery()}
                                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                                placeholder="Search players..."
                                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Players List */}
                        <div class="space-y-2 max-h-[600px] overflow-y-auto">
                            <For each={availablePlayers}>
                                {(player) => (
                                    <button
                                        onClick={() => setSelectedPlayer(player.id)}
                                        class={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${selectedPlayer() === player.id
                                                ? "bg-blue-600/20 border-blue-500"
                                                : "bg-slate-900/50 border-slate-600 hover:bg-slate-900/80"
                                            }`}
                                    >
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">
                                                {player.name.charAt(0)}
                                            </div>
                                            <div class="text-left">
                                                <p class="text-white font-semibold">{player.name}</p>
                                                <p class="text-slate-400 text-sm">
                                                    {player.position} • {player.team}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedPlayer() === player.id && (
                                            <span class="text-blue-400">✓</span>
                                        )}
                                    </button>
                                )}
                            </For>
                        </div>

                        {/* Make Pick Button */}
                        <button
                            onClick={makePick}
                            disabled={!selectedPlayer()}
                            class="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-lg"
                        >
                            {selectedPlayer() ? "Confirm Pick" : "Select a Player"}
                        </button>
                    </div>

                    {/* Sidebar */}
                    <div class="space-y-6">
                        {/* Recent Picks */}
                        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                            <h3 class="text-xl font-bold text-white mb-4">Recent Picks</h3>
                            <div class="space-y-3">
                                <For each={recentPicks}>
                                    {(pick) => (
                                        <div class="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                                            <p class="text-white font-semibold">{pick.player}</p>
                                            <p class="text-slate-400 text-sm">
                                                {pick.position} • {pick.team}
                                            </p>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                            <h3 class="text-xl font-bold text-white mb-4">Draft Stats</h3>
                            <dl class="space-y-2">
                                <div class="flex justify-between">
                                    <dt class="text-slate-400">Total Picks:</dt>
                                    <dd class="text-white font-semibold">4 / 80</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-slate-400">Forwards:</dt>
                                    <dd class="text-white font-semibold">2</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-slate-400">Defense:</dt>
                                    <dd class="text-white font-semibold">1</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-slate-400">Goalies:</dt>
                                    <dd class="text-white font-semibold">1</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Admin Actions (for host only) */}
                        <button
                            onClick={finishDraft}
                            class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Finish Draft (Demo)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

