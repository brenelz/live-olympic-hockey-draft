import { createFileRoute, Link } from "@tanstack/solid-router";
import { Button } from "~/components/ui/button";
import { Header } from "~/components/header";
import { fetchUserDrafts } from "~/lib/server";
import DraftStatusCards from "~/components/draft-status-cards";
import YourDrafts from "~/components/your-drafts";
import { createAsync } from "~/lib/utils";
import { Show, Suspense } from "solid-js";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,
  loader: async () => {
    const draftsPromise = fetchUserDrafts();
    return { draftsPromise };
  },
});

function Dashboard() {
  const context = Route.useRouteContext();
  const loaderData = Route.useLoaderData();
  const drafts = createAsync(() => loaderData().draftsPromise);
  const user = createAsync(() => context().userPromise);

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
                    Welcome back, {user()?.name}!
                  </h2>
                  <p class="text-slate-300 mt-1">
                    Ready to start your Olympic Hockey Draft?
                  </p>
                </div>
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

            {/* Draft Status Cards */}
            <Suspense fallback={<div class="text-slate-400">Loading...</div>}>
              <Show when={drafts()}>
                <DraftStatusCards drafts={drafts()!} />
                <YourDrafts drafts={drafts()!} />
              </Show>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
