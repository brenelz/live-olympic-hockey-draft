import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, createSignal } from "solid-js";

export const Route = createFileRoute("/draft/$id/pre")({
  component: PreDraft,
});

function PreDraft() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = createSignal(false);

  // Dummy data
  const draftInfo = {
    name: "2026 Olympics Draft",
    startTime: "Feb 15, 2025 at 7:00 PM",
    host: "John Doe",
    status: "PRE" as const,
  };

  const teams = [
    { id: 1, name: "Maple Leafs", owner: "John Doe", order: 1 },
    { id: 2, name: "Bruins", owner: "Jane Smith", order: 2 },
    { id: 3, name: "Penguins", owner: "Bob Johnson", order: 3 },
    { id: 4, name: "Lightning", owner: "Alice Williams", order: 4 },
    { id: 5, name: "Avalanche", owner: "Charlie Brown", order: 5 },
    { id: 6, name: "Empty Slot", owner: null, order: 6 },
    { id: 7, name: "Empty Slot", owner: null, order: 7 },
    { id: 8, name: "Empty Slot", owner: null, order: 8 },
  ];

  const inviteLink = `${window.location.origin}/draft/join?id=${id}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const startDraft = () => {
    navigate({ to: "/draft/$id/during", params: { id } });
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-8">
      <div class="max-w-6xl mx-auto">
        {/* Header */}
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8 mb-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h1 class="text-4xl font-bold text-white mb-2">
                {draftInfo.name}
              </h1>
              <div class="flex items-center gap-4 text-slate-300">
                <span>📅 {draftInfo.startTime}</span>
                <span>•</span>
                <span>👤 Hosted by {draftInfo.host}</span>
              </div>
            </div>
            <span class="px-4 py-2 bg-yellow-600/20 text-yellow-300 rounded-lg font-medium border border-yellow-600/30">
              Pre-Draft
            </span>
          </div>

          {/* Invite Link */}
          <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
            <label class="block text-sm font-medium text-slate-200 mb-2">
              Invite Link
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readonly
                class="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 font-mono text-sm"
              />
              <button
                onClick={copyInviteLink}
                class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                {copySuccess() ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Teams List */}
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8 mb-6">
          <h2 class="text-2xl font-bold text-white mb-6">
            Draft Order & Teams
          </h2>
          <div class="space-y-3">
            <For each={teams}>
              {(team) => (
                <div
                  class={`flex items-center justify-between p-4 rounded-lg border ${team.owner
                      ? "bg-slate-900/50 border-slate-600"
                      : "bg-slate-900/20 border-slate-700 border-dashed"
                    }`}
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 flex items-center justify-center bg-slate-700 rounded-full text-white font-bold">
                      {team.order}
                    </div>
                    <div>
                      <p class="text-white font-semibold">{team.name}</p>
                      {team.owner && (
                        <p class="text-slate-400 text-sm">{team.owner}</p>
                      )}
                    </div>
                  </div>
                  {team.owner ? (
                    <span class="text-green-400 text-sm">✓ Joined</span>
                  ) : (
                    <span class="text-slate-500 text-sm">Waiting...</span>
                  )}
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex gap-4">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={startDraft}
            class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-500/30"
          >
            Start Draft →
          </button>
        </div>
      </div>
    </div>
  );
}


export const Route = createFileRoute('/draft/$id/pre')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/draft/$id/pre"!</div>
}
