import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

export const Route = createFileRoute("/draft/create")({
    component: CreateDraft,
});

function CreateDraft() {
    const navigate = useNavigate();
    const [draftName, setDraftName] = createSignal("");
    const [startDate, setStartDate] = createSignal("");
    const [startTime, setStartTime] = createSignal("");

    const handleCreateDraft = (e: Event) => {
        e.preventDefault();
        // TODO: Implement draft creation logic
        console.log("Creating draft:", {
            name: draftName(),
            date: startDate(),
            time: startTime(),
        });
        // Navigate to pre-draft page after creation
        navigate({ to: "/draft/$id/pre", params: { id: "draft-123" } });
    };

    return (
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
            <div class="max-w-2xl mx-auto">
                <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8">
                    <h1 class="text-4xl font-bold text-white mb-2">Create New Draft</h1>
                    <p class="text-slate-400 mb-8">
                        Set up your Olympic hockey draft and invite your friends
                    </p>

                    <form onSubmit={handleCreateDraft} class="space-y-6">
                        {/* Draft Name */}
                        <div>
                            <label
                                for="draft-name"
                                class="block text-sm font-medium text-slate-200 mb-2"
                            >
                                Draft Name
                            </label>
                            <input
                                id="draft-name"
                                type="text"
                                value={draftName()}
                                onInput={(e) => setDraftName(e.currentTarget.value)}
                                placeholder="e.g., 2026 Olympics Draft"
                                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Start Date */}
                        <div>
                            <label
                                for="start-date"
                                class="block text-sm font-medium text-slate-200 mb-2"
                            >
                                Start Date
                            </label>
                            <input
                                id="start-date"
                                type="date"
                                value={startDate()}
                                onInput={(e) => setStartDate(e.currentTarget.value)}
                                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label
                                for="start-time"
                                class="block text-sm font-medium text-slate-200 mb-2"
                            >
                                Start Time
                            </label>
                            <input
                                id="start-time"
                                type="time"
                                value={startTime()}
                                onInput={(e) => setStartTime(e.currentTarget.value)}
                                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Number of Teams */}
                        <div>
                            <label
                                for="num-teams"
                                class="block text-sm font-medium text-slate-200 mb-2"
                            >
                                Number of Teams
                            </label>
                            <select
                                id="num-teams"
                                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="4">4 Teams</option>
                                <option value="6">6 Teams</option>
                                <option value="8" selected>
                                    8 Teams
                                </option>
                                <option value="10">10 Teams</option>
                                <option value="12">12 Teams</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div class="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate({ to: "/dashboard" })}
                                class="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/30"
                            >
                                Create Draft
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Card */}
                <div class="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <h3 class="text-blue-300 font-semibold mb-2">What happens next?</h3>
                    <ul class="text-slate-300 text-sm space-y-1">
                        <li>• You'll receive a shareable link to invite participants</li>
                        <li>• Set the draft order before the draft begins</li>
                        <li>• All participants can join before the start time</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

