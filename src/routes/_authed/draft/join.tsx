import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { useMutation } from "convex-solidjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { createSignal, Show } from "solid-js";
import { Header } from "~/components/header";

export const Route = createFileRoute("/_authed/draft/join")({
  component: JoinDraft,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: (search.id as string) || "",
    };
  },
});

function JoinDraft() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [error, setError] = createSignal("");
  const [draftIdInput, setDraftIdInput] = createSignal(search().id || "");
  const [teamName, setTeamName] = createSignal("");

  const { mutate: joinDraft } = useMutation(api.draftTeams.joinDraft);

  const handleJoinDraft = async (e: Event) => {
    e.preventDefault();
    const id = draftIdInput().trim();
    const name = teamName().trim();

    if (id) {
      await joinDraft({ draftId: id as Id<"drafts">, teamName: name })
      return navigate({ to: "/draft/$id/pre", params: { id } });
    } else {
      setError("Please enter a draft ID");
    }
  };


  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800">
      <Header />
      <div class="p-8">
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
                Enter a draft ID or use an invite link
              </p>
            </div>

            {/* Draft ID Input - Always visible */}
            <form onSubmit={handleJoinDraft} class="mb-6">

              <div class="bg-slate-900/50 rounded-lg p-6 border border-slate-600">
                <label
                  for="draft-id-input"
                  class="block text-sm font-medium text-slate-200 mb-3"
                >
                  Team Name
                </label>

                <input
                  id="draft-id-input"
                  type="text"
                  value={teamName()}
                  onInput={(e) => setTeamName(e.currentTarget.value)}
                  placeholder="Team Name"
                  class="w-full flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                  required
                />

                <br /> <br />

                <label
                  for="draft-id-input"
                  class="block text-sm font-medium text-slate-200 mb-3"
                >
                  Draft ID
                </label>
                <div class="flex gap-3">
                  <input
                    id="draft-id-input"
                    type="text"
                    value={draftIdInput()}
                    onInput={(e) => setDraftIdInput(e.currentTarget.value)}
                    placeholder="Paste draft ID here..."
                    class="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                    required
                  />
                  <button
                    type="submit"
                    class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-purple-500/30 whitespace-nowrap"
                  >
                    Join
                  </button>
                </div>

                <p class="text-sm text-slate-400 mt-2">
                  Get the draft ID from the person who created the draft
                </p>
              </div>
            </form>

            {/* Error Message */}
            <Show when={error()}>
              <div class="p-4 bg-red-900/30 border border-red-700/50 rounded-lg mb-6">
                <p class="text-red-300 text-sm">{error()}</p>
              </div>
            </Show>

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
      </div >
    </div >
  );
}

