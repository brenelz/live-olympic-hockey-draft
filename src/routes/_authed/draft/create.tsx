import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { useMutation } from "convex-solidjs";
import { api } from "../../../../convex/_generated/api";

export const Route = createFileRoute("/_authed/draft/create")({
  component: CreateDraft,
});

function CreateDraft() {
  const navigate = useNavigate();
  
  // Get current date and time as defaults
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const [draftName, setDraftName] = createSignal("");
  const [startDate, setStartDate] = createSignal(currentDate);
  const [startTime, setStartTime] = createSignal(currentTime);
  const [isCreating, setIsCreating] = createSignal(false);
  const [error, setError] = createSignal("");

  const { mutate: createDraft } = useMutation(api.drafts.create);

  const handleCreateDraft = async (e: Event) => {
    e.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      // Combine date and time into a Unix timestamp
      const dateTimeString = `${startDate()}T${startTime()}`;
      const startDatetime = new Date(dateTimeString).getTime();

      // Validate the datetime
      if (isNaN(startDatetime)) {
        throw new Error("Invalid date or time selected");
      }

      // Create the draft
      const draftId = await createDraft({
        name: draftName(),
        startDatetime,
      });

      // Navigate to the newly created draft's pre-draft page
      navigate({ to: "/draft/$id/pre", params: { id: draftId } });
    } catch (err) {
      console.error("Failed to create draft:", err);
      setError(err instanceof Error ? err.message : "Failed to create draft");
      setIsCreating(false);
    }
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
            {/* Error Message */}
            <Show when={error()}>
              <div class="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                <p class="text-red-300 text-sm">{error()}</p>
              </div>
            </Show>

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
                disabled={isCreating()}
                class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/30"
              >
                {isCreating() ? "Creating..." : "Create Draft"}
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

