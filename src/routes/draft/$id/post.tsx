import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, createSignal } from "solid-js";

export const Route = createFileRoute("/draft/$id/post")({
    component: PostDraft,
});

function PostDraft() {
    const { id } = Route.useParams();
    const navigate = useNavigate();
    const [selectedTeam, setSelectedTeam] = createSignal<string | null>("team-1");

    // Dummy data
    const draftInfo = {
        name: "2026 Olympics Draft",
        completedAt: "Feb 15, 2025 at 9:30 PM",
        duration: "2h 30m",
        totalPicks: 80,
    };

    const teams = [
        { id: "team-1", name: "Maple Leafs", owner: "John Doe" },
        { id: "team-2", name: "Bruins", owner: "Jane Smith" },
        { id: "team-3", name: "Penguins", owner: "Bob Johnson" },
        { id: "team-4", name: "Lightning", owner: "Alice Williams" },
        { id: "team-5", name: "Avalanche", owner: "Charlie Brown" },
    ];

    const teamRoster = {
        "team-1": {
            forwards: [
                { name: "Connor McDavid", position: "C", pickNum: 1 },
                { name: "David Pastrnak", position: "RW", pickNum: 12 },
                { name: "Brad Marchand", position: "LW", pickNum: 23 },
                { name: "Mitch Marner", position: "RW", pickNum: 34 },
            ],
            defense: [
                { name: "Cale Makar", position: "D", pickNum: 8 },
                { name: "Adam Fox", position: "D", pickNum: 17 },
                { name: "Charlie McAvoy", position: "D", pickNum: 28 },
            ],
            goalies: [
                { name: "Igor Shesterkin", position: "G", pickNum: 45 },
                { name: "Jeremy Swayman", position: "G", pickNum: 56 },
            ],
        },
    };

    const currentRoster = () => teamRoster[selectedTeam() as keyof typeof teamRoster] || { forwards: [], defense: [], goalies: [] };

    return (
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
            <div class="max-w-7xl mx-auto">
                {/* Header */}
                <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8 mb-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h1 class="text-4xl font-bold text-white mb-2">
                                {draftInfo.name}
                            </h1>
                            <div class="flex items-center gap-4 text-slate-300">
                                <span>✓ Completed {draftInfo.completedAt}</span>
                                <span>•</span>
                                <span>Duration: {draftInfo.duration}</span>
                            </div>
                        </div>
                        <span class="px-4 py-2 bg-green-600/20 text-green-300 rounded-lg font-medium border border-green-600/30">
                            Complete
                        </span>
                    </div>

                    {/* Summary Stats */}
                    <div class="grid grid-cols-4 gap-4 mt-6">
                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                            <p class="text-slate-400 text-sm mb-1">Total Picks</p>
                            <p class="text-2xl font-bold text-white">{draftInfo.totalPicks}</p>
                        </div>
                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                            <p class="text-slate-400 text-sm mb-1">Teams</p>
                            <p class="text-2xl font-bold text-white">{teams.length}</p>
                        </div>
                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                            <p class="text-slate-400 text-sm mb-1">Rounds</p>
                            <p class="text-2xl font-bold text-white">10</p>
                        </div>
                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                            <p class="text-slate-400 text-sm mb-1">Avg Pick Time</p>
                            <p class="text-2xl font-bold text-white">1:52</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Team Selector */}
                    <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                        <h2 class="text-xl font-bold text-white mb-4">Teams</h2>
                        <div class="space-y-2">
                            <For each={teams}>
                                {(team) => (
                                    <button
                                        onClick={() => setSelectedTeam(team.id)}
                                        class={`w-full text-left p-4 rounded-lg border transition-all ${selectedTeam() === team.id
                                                ? "bg-indigo-600/20 border-indigo-500"
                                                : "bg-slate-900/50 border-slate-600 hover:bg-slate-900/80"
                                            }`}
                                    >
                                        <p class="text-white font-semibold">{team.name}</p>
                                        <p class="text-slate-400 text-sm">{team.owner}</p>
                                    </button>
                                )}
                            </For>
                        </div>
                    </div>

                    {/* Roster View */}
                    <div class="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                        <h2 class="text-2xl font-bold text-white mb-6">
                            {teams.find((t) => t.id === selectedTeam())?.name} Roster
                        </h2>

                        {/* Forwards */}
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Forwards ({currentRoster().forwards.length})
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <For each={currentRoster().forwards}>
                                    {(player) => (
                                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                                            <div class="flex justify-between items-start mb-1">
                                                <p class="text-white font-semibold">{player.name}</p>
                                                <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                                    #{player.pickNum}
                                                </span>
                                            </div>
                                            <p class="text-slate-400 text-sm">{player.position}</p>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>

                        {/* Defense */}
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                Defense ({currentRoster().defense.length})
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <For each={currentRoster().defense}>
                                    {(player) => (
                                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                                            <div class="flex justify-between items-start mb-1">
                                                <p class="text-white font-semibold">{player.name}</p>
                                                <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                                    #{player.pickNum}
                                                </span>
                                            </div>
                                            <p class="text-slate-400 text-sm">{player.position}</p>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>

                        {/* Goalies */}
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                                Goalies ({currentRoster().goalies.length})
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <For each={currentRoster().goalies}>
                                    {(player) => (
                                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                                            <div class="flex justify-between items-start mb-1">
                                                <p class="text-white font-semibold">{player.name}</p>
                                                <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                                    #{player.pickNum}
                                                </span>
                                            </div>
                                            <p class="text-slate-400 text-sm">{player.position}</p>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div class="mt-6 flex gap-4">
                    <button
                        onClick={() => navigate({ to: "/dashboard" })}
                        class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => console.log("Export draft results")}
                        class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Export Results
                    </button>
                </div>
            </div>
        </div>
    );
}

