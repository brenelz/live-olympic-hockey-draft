import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

export const Route = createFileRoute("/draft/join")({
    component: JoinDraft,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            id: (search.id as string) || "",
        };
    },
});

function JoinDraft() {
    const navigate = useNavigate();
    const { id } = Route.useSearch();
    const [teamName, setTeamName] = createSignal("");

    const handleJoinDraft = (e: Event) => {
        e.preventDefault();
        // TODO: Implement join draft logic
        console.log("Joining draft:", id, "with team name:", teamName());
        // Navigate to pre-draft page after joining
        navigate({ to: "/draft/$id/pre", params: { id } });
    };

    return (
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div class="max-w-2xl mx-auto">
                <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8">
                    {/* Header */}
                    <div class="text-center mb-8">
                        <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mb-4">
                            <svg
                                class="w-8 h-8 text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                        </div>
                        <h1 class="text-4xl font-bold text-white mb-2">Join Draft</h1>
                        <p class="text-slate-400">
                            You've been invited to join an Olympic hockey draft
                        </p>
                    </div>

                    {/* Draft Info */}
                    <div class="bg-slate-900/50 rounded-lg p-6 mb-6 border border-slate-600">
                        <h2 class="text-xl font-semibold text-white mb-4">Draft Details</h2>
                        <dl class="space-y-3">
                            <div class="flex justify-between">
                                <dt class="text-slate-400">Draft ID:</dt>
                                <dd class="text-white font-mono">{id || "Not provided"}</dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-400">Draft Name:</dt>
                                <dd class="text-white">2026 Olympics Draft</dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-400">Host:</dt>
                                <dd class="text-white">John Doe</dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-400">Start Time:</dt>
                                <dd class="text-white">Feb 15, 2025 at 7:00 PM</dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-400">Teams Joined:</dt>
                                <dd class="text-white">5 / 8</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Join Form */}
                    <form onSubmit={handleJoinDraft} class="space-y-6">
                        <div>
                            <label
                                for="team-name"
                                class="block text-sm font-medium text-slate-200 mb-2"
                            >
                                Your Team Name
                            </label>
                            <input
                                id="team-name"
                                type="text"
                                value={teamName()}
                                onInput={(e) => setTeamName(e.currentTarget.value)}
                                placeholder="e.g., Maple Leafs, Bruins, etc."
                                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                required
                            />
                            <p class="text-sm text-slate-400 mt-2">
                                Choose a unique name for your team
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div class="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate({ to: "/" })}
                                class="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-purple-500/30"
                            >
                                Join Draft
                            </button>
                        </div>
                    </form>
                </div>

                {/* Warning Card */}
                <div class="mt-6 bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
                    <div class="flex gap-3">
                        <svg
                            class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <p class="text-amber-200 text-sm">
                            Make sure you're available at the scheduled draft time. Missing
                            your picks may result in auto-selection.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

