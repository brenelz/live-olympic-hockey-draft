import { createFileRoute, useNavigate, Link } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { useQuery, useMutation } from "convex-solidjs";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,

});

function Dashboard() {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = createSignal(false);
  const [newTodoText, setNewTodoText] = createSignal("");

  // Convex queries and mutations
  const { data: todos } = useQuery(api.todos.list, {});
  const { mutate: createTodo } = useMutation(api.todos.create);
  const { mutate: toggleTodo } = useMutation(api.todos.toggle);
  const { mutate: removeTodo } = useMutation(api.todos.remove);

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

  const handleAddTodo = async (e: Event) => {
    e.preventDefault();
    const text = newTodoText().trim();
    if (!text) return;

    try {
      await createTodo({ text });
      setNewTodoText("");
    } catch (err) {
      console.error("Failed to create todo:", err);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      await toggleTodo({ id: id as any });
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
  };

  const handleRemoveTodo = async (id: string) => {
    try {
      await removeTodo({ id: id as any });
    } catch (err) {
      console.error("Failed to remove todo:", err);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800">
      <header class="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <Link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
            </Link>
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium text-white">{session()?.data?.user?.name}</p>
                <p class="text-xs text-slate-300">{session()?.data?.user?.email}</p>
              </div>
              {/* User Avatar */}
              <div class="relative">
                {session()?.data?.user?.image ? (
                  <img
                    src={session()?.data?.user?.image ?? ""}
                    alt={session()?.data?.user?.name ?? "User"}
                    class="w-10 h-10 rounded-full border-2 border-white/30 bg-slate-700 object-cover"
                  />
                ) : (
                  <div class="w-10 h-10 rounded-full border-2 border-white/30 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">
                      {session()?.data?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
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
              <Link to="/draft/create">
                <Button class="w-full h-16 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Draft
                </Button>
              </Link>
              <Link to="/draft/join" search={{ id: "" }}>
                <Button variant="outline" class="w-full h-16 text-base font-semibold border-2">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Join Existing Draft
                </Button>
              </Link>
            </div>
          </div>

          {/* Todos Section */}
          <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Your Todos</h3>

            {/* Add Todo Form */}
            <form onSubmit={handleAddTodo} class="mb-6">
              <div class="flex gap-3">
                <input
                  type="text"
                  value={newTodoText()}
                  onInput={(e) => setNewTodoText(e.currentTarget.value)}
                  placeholder="Add a new todo..."
                  class="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
                <Button
                  type="submit"
                  disabled={!newTodoText().trim()}
                  class="px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </Button>
              </div>
            </form>

            {/* Todo List */}
            <Show
              when={todos?.() && (todos()?.length ?? 0) > 0}
              fallback={
                <div class="text-center py-8 text-slate-500">
                  <svg class="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p class="text-lg font-medium">No todos yet</p>
                  <p class="text-sm">Add your first todo above to get started!</p>
                </div>
              }
            >
              <div class="space-y-3">
                <For each={todos?.() || []}>
                  {(todo) => (
                    <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors group">
                      <button
                        onClick={() => handleToggleTodo(todo._id)}
                        class="flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all"
                        classList={{
                          "bg-green-500 border-green-500": todo.isCompleted,
                          "border-slate-300 hover:border-blue-500": !todo.isCompleted,
                        }}
                      >
                        <Show when={todo.isCompleted}>
                          <svg class="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </Show>
                      </button>
                      <span
                        class="flex-1 text-slate-900 transition-all"
                        classList={{
                          "line-through text-slate-500": todo.isCompleted,
                        }}
                      >
                        {todo.text}
                      </span>
                      <button
                        onClick={() => handleRemoveTodo(todo._id)}
                        class="flex-shrink-0 p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-md transition-all"
                        title="Delete todo"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>

          {/* Your Drafts */}
          <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Your Drafts</h3>

            {/* Demo Drafts - Replace with real data later */}
            <div class="space-y-4">
              {/* Pre-Draft Example */}
              <Link to="/draft/$id/pre" params={{ id: "draft-123" }}>
                <div class="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 transition-all cursor-pointer hover:shadow-md">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <span class="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">PRE-DRAFT</span>
                      <h4 class="text-lg font-bold text-slate-900">2026 Olympics Draft</h4>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-slate-600">
                    <span>📅 Feb 15, 2025 at 7:00 PM</span>
                    <span>•</span>
                    <span>👤 5/8 teams joined</span>
                  </div>
                </div>
              </Link>

              {/* Live Draft Example */}
              <Link to="/draft/$id/during" params={{ id: "draft-456" }}>
                <div class="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all cursor-pointer hover:shadow-md">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <span class="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">LIVE</span>
                      <h4 class="text-lg font-bold text-slate-900">Summer League Draft</h4>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-slate-600">
                    <span>🎯 Round 3 • Pick #18</span>
                    <span>•</span>
                    <span>⏱️ Your pick in 2 turns</span>
                  </div>
                </div>
              </Link>

              {/* Completed Draft Example */}
              <Link to="/draft/$id/post" params={{ id: "draft-789" }}>
                <div class="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all cursor-pointer hover:shadow-md">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <span class="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">COMPLETE</span>
                      <h4 class="text-lg font-bold text-slate-900">Winter Classic Draft</h4>
                    </div>
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-slate-600">
                    <span>✓ Completed Jan 28, 2025</span>
                    <span>•</span>
                    <span>🏆 Your team: Maple Leafs</span>
                  </div>
                </div>
              </Link>
            </div>

            <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-sm text-blue-800">
                💡 <strong>Demo Mode:</strong> These are example drafts. Real draft data will appear here once you create or join a draft.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

