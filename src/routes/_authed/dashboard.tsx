import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import { Header } from "~/components/header";
import { fetchUserDrafts } from "~/lib/server";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,
  loader: async () => {
    const drafts = await fetchUserDrafts();
    return { drafts };
  },
});

function Dashboard() {
  const context = Route.useRouteContext();
  const loaderData = Route.useLoaderData();

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800">
      <Header />
      <div class="p-8">
        <div class="max-w-7xl mx-auto">
          <div class="grid gap-6">
            {/* Welcome Section */}
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
              <div class="flex items-center gap-4 mb-6">
                <div class="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full">
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h2 class="text-3xl font-bold text-white">
                    Welcome back, {context().user.name}!
                  </h2>
                  <p class="text-slate-300 mt-1">
                    Ready to start your Olympic Hockey Draft?
                  </p>
                </div>
              </div>
            </div>

            {/* Draft Status Cards */}
            <div class="grid md:grid-cols-3 gap-6">
              <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-white">Pre-Draft</h3>
                  <div class="p-2 bg-yellow-600/20 rounded-lg border border-yellow-600/30">
                    <svg
                      class="w-5 h-5 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p class="text-3xl font-bold text-white">
                  {loaderData().drafts.filter((d) => d?.status === "PRE")
                    .length ?? 0}
                </p>
                <p class="text-sm text-slate-300 mt-2">
                  {(loaderData().drafts.filter((d) => d?.status === "PRE")
                    .length ?? 0) === 0
                    ? "No upcoming drafts"
                    : "Waiting to start"}
                </p>
              </div>

              <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-white">Live Drafts</h3>
                  <div class="p-2 bg-red-600/20 rounded-lg border border-red-600/30">
                    <svg
                      class="w-5 h-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <p class="text-3xl font-bold text-white">
                  {loaderData().drafts.filter((d) => d?.status === "DURING")
                    .length ?? 0}
                </p>
                <p class="text-sm text-slate-300 mt-2">
                  {(loaderData().drafts.filter((d) => d?.status === "DURING")
                    .length ?? 0) === 0
                    ? "No active drafts"
                    : "In progress"}
                </p>
              </div>

              <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-white">Completed</h3>
                  <div class="p-2 bg-green-600/20 rounded-lg border border-green-600/30">
                    <svg
                      class="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p class="text-3xl font-bold text-white">
                  {loaderData().drafts.filter((d) => d?.status === "POST")
                    .length ?? 0}
                </p>
                <p class="text-sm text-slate-300 mt-2">
                  {(loaderData().drafts.filter((d) => d?.status === "POST")
                    .length ?? 0) === 0
                    ? "No completed drafts"
                    : "Drafts finished"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
              <div class="grid sm:grid-cols-2 gap-4">
                <Link to="/draft/create">
                  <Button class="cursor-pointer w-full h-16 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30">
                    <svg
                      class="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create New Draft
                  </Button>
                </Link>
                <Link to="/draft/join" search={{ id: "" }}>
                  <Button
                    variant="outline"
                    class="cursor-pointer w-full h-16 text-base font-semibold border-2 border-slate-600 text-white hover:bg-slate-700"
                  >
                    <svg
                      class="w-5 h-5 mr-2"
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
                    Join Existing Draft
                  </Button>
                </Link>
              </div>
            </div>

            {/* Your Drafts */}
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
              <h3 class="text-2xl font-bold text-white mb-6">Your Drafts</h3>

              <Show
                when={loaderData().drafts}
                fallback={<div class="text-slate-400">Loading...</div>}
              >
                <Show
                  when={loaderData().drafts && loaderData().drafts.length > 0}
                  fallback={
                    <div class="text-center py-12 text-slate-400">
                      <svg
                        class="w-20 h-20 mx-auto mb-4 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p class="text-xl font-medium mb-2 text-white">
                        No drafts yet
                      </p>
                      <p class="text-sm mb-6">
                        Create a new draft or join an existing one to get
                        started!
                      </p>
                      <div class="flex justify-center gap-3">
                        <Link to="/draft/create">
                          <Button class="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                            Create New Draft
                          </Button>
                        </Link>
                        <Link to="/draft/join" search={{ id: "" }}>
                          <Button
                            variant="outline"
                            class="cursor-pointer border-slate-600 text-white hover:bg-slate-700"
                          >
                            Join Draft
                          </Button>
                        </Link>
                      </div>
                    </div>
                  }
                >
                  <div class="space-y-4">
                    <For each={loaderData().drafts ?? []}>
                      {(draft) => {
                        const statusConfig = () => {
                          switch (draft?.status) {
                            case "PRE":
                              return {
                                route: "/draft/$id/pre" as const,
                                bgClass: "from-yellow-900/30 to-orange-900/30",
                                borderClass:
                                  "border-yellow-600/30 hover:border-yellow-600/50",
                                badgeClass:
                                  "bg-yellow-600/20 border-yellow-600/30 text-yellow-300",
                                badgeText: "PRE-DRAFT",
                              };
                            case "DURING":
                              return {
                                route: "/draft/$id/during" as const,
                                bgClass: "from-red-900/30 to-pink-900/30",
                                borderClass:
                                  "border-red-600/30 hover:border-red-600/50",
                                badgeClass:
                                  "bg-red-600/20 border-red-600/30 text-red-300 animate-pulse",
                                badgeText: "LIVE",
                              };
                            case "POST":
                              return {
                                route: "/draft/$id/post" as const,
                                bgClass: "from-green-900/30 to-emerald-900/30",
                                borderClass:
                                  "border-green-600/30 hover:border-green-600/50",
                                badgeClass:
                                  "bg-green-600/20 border-green-600/30 text-green-300",
                                badgeText: "COMPLETE",
                              };
                            default:
                              return {
                                route: "/draft/$id/pre" as const,
                                bgClass: "from-slate-700/30 to-slate-800/30",
                                borderClass:
                                  "border-slate-600 hover:border-slate-500",
                                badgeClass:
                                  "bg-slate-600/20 border-slate-600/30 text-slate-300",
                                badgeText: "UNKNOWN",
                              };
                          }
                        };

                        const formatDate = (timestamp: number) => {
                          const date = new Date(timestamp);
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          });
                        };

                        return (
                          <Link
                            to={statusConfig().route}
                            params={{ id: draft?._id ?? "" }}
                          >
                            <div
                              class={`cursor-pointer p-6 bg-gradient-to-r ${
                                statusConfig().bgClass
                              } rounded-xl border-2 ${
                                statusConfig().borderClass
                              } transition-all cursor-pointer hover:shadow-md mb-4`}
                            >
                              <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-3">
                                  <span
                                    class={`px-4 py-2 ${
                                      statusConfig().badgeClass
                                    } text-sm font-medium rounded-lg border`}
                                  >
                                    {statusConfig().badgeText}
                                  </span>
                                  <h4 class="text-lg font-bold text-white">
                                    {draft?.name}
                                  </h4>
                                </div>
                                <svg
                                  class="w-5 h-5 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                              <div class="flex items-center gap-4 text-sm text-slate-300">
                                <span>
                                  📅 {formatDate(draft?.startDatetime ?? 0)}
                                </span>
                                <span>•</span>
                                <span>
                                  👥 {draft?.teamCount}{" "}
                                  {draft?.teamCount === 1 ? "team" : "teams"}
                                </span>
                                {draft?.userTeamName && (
                                  <>
                                    <span>•</span>
                                    <span>🏆 {draft?.userTeamName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
