import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createEffect, createSignal } from "solid-js";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = createSignal(false);

  // Redirect to login if not authenticated
  createEffect(() => {
    if (!session().data?.session) {
      navigate({ to: "/" });
    }
  });

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      navigate({ to: "/" });
    } catch (err) {
      console.error("Sign out error:", err);
      setIsSigningOut(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800">
      {/* Header/Navigation */}
      <header class="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  {/* Hockey puck icon */}
                  <ellipse cx="12" cy="8" rx="9" ry="3" opacity="0.3" />
                  <path d="M21 8c0 1.657-4.03 3-9 3S3 9.657 3 8s4.03-3 9-3 9 1.343 9 3z" />
                  <path d="M3 8v8c0 1.657 4.03 3 9 3s9-1.343 9-3V8c0 1.657-4.03 3-9 3s-9-1.343-9-3z" opacity="0.8" />
                  <path d="M21 16c0 1.657-4.03 3-9 3s-9-1.343-9-3" />
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Live Olympic Hockey Draft</h1>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium text-white">{session().data?.user?.name}</p>
                <p class="text-xs text-slate-300">{session().data?.user?.email}</p>
              </div>
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut()}
                variant="outline"
                class="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                {isSigningOut() ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid gap-6">
          {/* Welcome Section */}
          <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 class="text-3xl font-bold text-slate-900">Welcome back, {session().data?.user?.name}!</h2>
                <p class="text-slate-600 mt-1">Ready to start your Olympic Hockey Draft?</p>
              </div>
            </div>
          </div>

          {/* Draft Status Cards */}
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-900">Active Drafts</h3>
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-slate-900">0</p>
              <p class="text-sm text-slate-600 mt-2">No active drafts</p>
            </div>

            <div class="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-900">Your Teams</h3>
                <div class="p-2 bg-purple-100 rounded-lg">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-slate-900">0</p>
              <p class="text-sm text-slate-600 mt-2">No teams yet</p>
            </div>

            <div class="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-900">Completed</h3>
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-slate-900">0</p>
              <p class="text-sm text-slate-600 mt-2">No completed drafts</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div class="grid sm:grid-cols-2 gap-4">
              <Button class="h-16 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Draft
              </Button>
              <Button variant="outline" class="h-16 text-base font-semibold border-2">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Join Existing Draft
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h3>
            <div class="text-center py-12">
              <div class="inline-block p-4 bg-slate-100 rounded-full mb-4">
                <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p class="text-slate-600 font-medium">No recent activity</p>
              <p class="text-sm text-slate-500 mt-2">Create a draft to get started!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

