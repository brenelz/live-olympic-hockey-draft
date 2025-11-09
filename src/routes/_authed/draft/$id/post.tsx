import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, createSignal, Show, createMemo, Suspense } from "solid-js";
import type { Id } from "convex/_generated/dataModel";
import { Header } from "~/components/header";
import { RosterView } from "~/components/post-draft/roster-view";
import { authClient } from "~/lib/auth-client";
import { createAsync, formatDate } from "~/lib/utils";
import { fetchDraftPostData } from "~/lib/server";

export const Route = createFileRoute("/_authed/draft/$id/post")({
  component: PostDraft,
  loader: async ({ params }) => {
    const dataPromise = fetchDraftPostData({ data: { draftId: params.id } });
    return { dataPromise };
  },
});

function PostDraft() {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const loaderData = Route.useLoaderData();
  const data = createAsync(() => loaderData().dataPromise);

  const [selectedTeamId, setSelectedTeamId] =
    createSignal<Id<"draftTeams"> | null>(null);

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800" >
      <Header />
      <div class="p-6">
        <div class="max-w-7xl mx-auto">
          {/* Header */}
          <Suspense fallback={<div class="flex flex-col items-center justify-center min-h-[60vh]">
            <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
            <p class="text-slate-300 text-lg font-medium">Loading draft...</p>
          </div>}>
            <Show when={data()?.draft}>
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
                      </div>
                    </div>
                    <span class="px-4 py-2 bg-green-600/20 text-green-300 rounded-lg font-medium border border-green-600/30">
                      Complete
                    </span>
                  </div>

                  {/* Summary Stats */}
                  <Show when={data()?.draftStats}>
                    {(stats) => (
                      <div class="grid grid-cols-3 gap-4 mt-6">
                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                          <p class="text-slate-400 text-sm mb-1">Total Picks</p>
                          <p class="text-2xl font-bold text-white">
                            {stats().totalPicks}
                          </p>
                        </div>
                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                          <p class="text-slate-400 text-sm mb-1">Teams</p>
                          <p class="text-2xl font-bold text-white">
                            {data()?.teamsWithRosters?.length || 0}
                          </p>
                        </div>
                        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                          <p class="text-slate-400 text-sm mb-1">Rounds</p>
                          <p class="text-2xl font-bold text-white">
                            {Math.ceil(
                              stats().maxPicks /
                              (data()?.teamsWithRosters?.length || 1)
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
              when={data()?.teamsWithRosters && data()?.teamsWithRosters.length! > 0}
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
                    <For each={data()?.teamsWithRosters || []}>
                      {(team) => {
                        const isUserTeam =
                          () => session()?.data?.user?.id && team.betterAuthUserId === session()?.data?.user?.id;
                        return (
                          <button
                            onClick={() => setSelectedTeamId(team.teamId)}
                            class={`w-full text-left p-4 rounded-lg border transition-all ${selectedTeamId() === team.teamId
                              ? isUserTeam()
                                ? "bg-blue-600/30 border-blue-500"
                                : "bg-indigo-600/20 border-indigo-500"
                              : isUserTeam()
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
                              <ClientOnly>
                                <Show when={isUserTeam()}>
                                  <span class="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                                    Your Team
                                  </span>
                                </Show>
                              </ClientOnly>
                            </div>
                          </button>
                        );
                      }}
                    </For>
                  </div>
                </div>

                {/* Roster View */}
                <RosterView teamsWithRosters={data()?.teamsWithRosters} selectedTeamId={selectedTeamId()} userId={session()?.data?.user?.id} />
              </div>
            </Show>
          </Suspense>

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
    </div >
  );
}
