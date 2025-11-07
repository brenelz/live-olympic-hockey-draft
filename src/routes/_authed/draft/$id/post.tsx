import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, createSignal, Show, createMemo } from "solid-js";
import { useQuery } from "convex-solidjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Header } from "~/components/header";
import { authClient } from "~/lib/auth-client";
import { formatDate } from "~/lib/utils";

export const Route = createFileRoute("/_authed/draft/$id/post")({
  component: PostDraft,
});

function PostDraft() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const draftId = params().id as Id<"drafts">;

  const { data: draft } = useQuery(api.drafts.getDraftById, { draftId });
  const { data: teamsWithRosters } = useQuery(api.draftPicks.getDraftRosters, {
    draftId,
  });
  const { data: draftStats } = useQuery(api.draftPicks.getDraftStats, { draftId });
  const session = authClient.useSession();

  const [selectedTeamId, setSelectedTeamId] =
    createSignal<Id<"draftTeams"> | null>(null);

  const currentUserId = () => session()?.data?.user?.id;

  // Find and auto-select the current user's team
  const userTeam = createMemo(() => {
    const teams = teamsWithRosters?.();
    const userId = currentUserId();
    if (!teams || !userId) return null;
    return teams.find((t) => t.betterAuthUserId === userId) || null;
  });

  // Set user's team as selected by default, otherwise first team
  createMemo(() => {
    const teams = teamsWithRosters?.();
    if (teams && teams.length > 0 && !selectedTeamId()) {
      const userTeamId = userTeam()?.teamId;
      setSelectedTeamId(userTeamId || teams[0].teamId);
    }
  });

  const selectedTeam = createMemo(() => {
    const teams = teamsWithRosters?.();
    if (!teams) return null;
    return teams.find((t) => t.teamId === selectedTeamId()) || teams[0] || null;
  });


  const calculateDuration = () => {
    if (!draft?.()) return "N/A";
    // For completed drafts, estimate duration based on picks made
    // In a real scenario, you'd store an endTime when the draft finishes
    const stats = draftStats?.();
    if (stats && stats.totalPicks > 0) {
      // Estimate: assume average 45 seconds per pick
      const estimatedSeconds = stats.totalPicks * 45;
      const hours = Math.floor(estimatedSeconds / 3600);
      const minutes = Math.floor((estimatedSeconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
    return "N/A";
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800">
      <Header />
      <div class="p-6">
        <div class="max-w-7xl mx-auto">
          {/* Header */}
          <Show when={draft?.()}>
            {(draftData) => (
              <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8 mb-6">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h1 class="text-4xl font-bold text-white mb-2">
                      {draftData().name}
                    </h1>
                    <div class="flex items-center gap-4 text-slate-300">
                      <span>
                        ✓ Completed {formatDate(draftData()._creationTime)}
                      </span>
                      <span>•</span>
                      <span>Duration: {calculateDuration()}</span>
                    </div>
                  </div>
                  <span class="px-4 py-2 bg-green-600/20 text-green-300 rounded-lg font-medium border border-green-600/30">
                    Complete
                  </span>
                </div>

                {/* Summary Stats */}
                <Show when={draftStats?.()}>
                  {(stats) => (
                    <div class="grid grid-cols-4 gap-4 mt-6">
                      <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                        <p class="text-slate-400 text-sm mb-1">Total Picks</p>
                        <p class="text-2xl font-bold text-white">
                          {stats().totalPicks}
                        </p>
                      </div>
                      <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                        <p class="text-slate-400 text-sm mb-1">Teams</p>
                        <p class="text-2xl font-bold text-white">
                          {teamsWithRosters?.()?.length || 0}
                        </p>
                      </div>
                      <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                        <p class="text-slate-400 text-sm mb-1">Rounds</p>
                        <p class="text-2xl font-bold text-white">
                          {Math.ceil(
                            stats().maxPicks /
                            (teamsWithRosters?.()?.length || 1)
                          )}
                        </p>
                      </div>
                      <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                        <p class="text-slate-400 text-sm mb-1">Avg Pick Time</p>
                        <p class="text-2xl font-bold text-white">
                          {stats().totalPicks > 0
                            ? Math.floor((45 * stats().totalPicks) / 60)
                            : 0}
                          :
                          {String((45 * stats().totalPicks) % 60).padStart(
                            2,
                            "0"
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </Show>
              </div>
            )}
          </Show>

          <Show
            when={teamsWithRosters?.() && teamsWithRosters()!.length > 0}
            fallback={
              <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8 text-center">
                <p class="text-slate-400">Loading teams...</p>
              </div>
            }
          >
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Team Selector */}
              <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                <h2 class="text-xl font-bold text-white mb-4">Teams</h2>
                <div class="space-y-2">
                  <For each={teamsWithRosters?.() || []}>
                    {(team) => {
                      const userId = currentUserId();
                      const isUserTeam =
                        userId && team.betterAuthUserId === userId;
                      return (
                        <button
                          onClick={() => setSelectedTeamId(team.teamId)}
                          class={`w-full text-left p-4 rounded-lg border transition-all ${selectedTeamId() === team.teamId
                            ? isUserTeam
                              ? "bg-blue-600/30 border-blue-500"
                              : "bg-indigo-600/20 border-indigo-500"
                            : isUserTeam
                              ? "bg-blue-600/10 border-blue-600/50 hover:bg-blue-600/20"
                              : "bg-slate-900/50 border-slate-600 hover:bg-slate-900/80"
                            }`}
                        >
                          <div class="flex items-center justify-between">
                            <div>
                              <p class="text-white font-semibold">
                                {team.teamName}
                              </p>
                              <p class="text-slate-400 text-sm">
                                Pick #{team.draftOrderNumber}
                              </p>
                            </div>
                            <Show when={isUserTeam}>
                              <span class="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                                Your Team
                              </span>
                            </Show>
                          </div>
                        </button>
                      );
                    }}
                  </For>
                </div>
              </div>

              {/* Roster View */}
              <Show
                when={selectedTeam()}
                fallback={
                  <div class="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                    <p class="text-slate-400">Select a team to view roster</p>
                  </div>
                }
              >
                {(team) => {
                  const userId = currentUserId();
                  const isUserTeam = () =>
                    userId && team().betterAuthUserId === userId;
                  return (
                    <div class="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6">
                      <div class="flex items-center gap-3 mb-6">
                        <h2 class="text-2xl font-bold text-white">
                          {team().teamName} Roster
                        </h2>
                        <Show when={isUserTeam()}>
                          <span class="px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                            Your Team
                          </span>
                        </Show>
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
                              {(player) => (
                                <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                                  <div class="flex justify-between items-start mb-1">
                                    <p class="text-white font-semibold">
                                      {player.name}
                                    </p>
                                    <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                      #{player.pickNum}
                                    </span>
                                  </div>
                                  <p class="text-slate-400 text-sm">
                                    {player.position}
                                  </p>
                                </div>
                              )}
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
                              {(player) => (
                                <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                                  <div class="flex justify-between items-start mb-1">
                                    <p class="text-white font-semibold">
                                      {player.name}
                                    </p>
                                    <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                      #{player.pickNum}
                                    </span>
                                  </div>
                                  <p class="text-slate-400 text-sm">
                                    {player.position}
                                  </p>
                                </div>
                              )}
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
                              {(player) => (
                                <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                                  <div class="flex justify-between items-start mb-1">
                                    <p class="text-white font-semibold">
                                      {player.name}
                                    </p>
                                    <span class="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                      #{player.pickNum}
                                    </span>
                                  </div>
                                  <p class="text-slate-400 text-sm">
                                    {player.position}
                                  </p>
                                </div>
                              )}
                            </For>
                          </div>
                        </Show>
                      </div>
                    </div>
                  );
                }}
              </Show>
            </div>
          </Show>

          {/* Action Buttons */}
          <div class="mt-6 flex gap-4">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
