import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, createSignal, Show, onMount, onCleanup } from "solid-js";
import { useQuery, useMutation } from "convex-solidjs";
import { api } from "../../../../../convex/_generated/api";
import { authClient } from "~/lib/auth-client";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/draft/$id/pre")({
  component: PreDraft,
});

function PreDraft() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = createSignal(false);
  const [timeRemaining, setTimeRemaining] = createSignal<number | null>(null);
  const [isStarting, setIsStarting] = createSignal(false);
  const [error, setError] = createSignal("");

  const draftId = params().id as Id<"drafts">;
  const session = authClient.useSession();

  // Fetch draft data
  const { data: draft } = useQuery(api.drafts.getDraftById, { draftId });
  const { data: teams } = useQuery(api.drafts.getDraftTeams, { draftId });

  // Start draft mutation
  const { mutate: startDraft } = useMutation(api.drafts.startDraft);

  // Check if current user is host
  const isHost = () => {
    const user = session()?.data?.user;
    return user && draft?.() && draft()!.hostBetterAuthUserId && draft()!.hostBetterAuthUserId === user.id;
  };

  // Countdown timer
  onMount(() => {
    const updateCountdown = () => {
      if (draft?.()) {
        const now = Date.now();
        const startTime = draft()!.startDatetime;
        const remaining = startTime - now;
        setTimeRemaining(remaining > 0 ? remaining : 0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    onCleanup(() => clearInterval(interval));
  });

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return "Ready to start!";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
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

  const handleStartDraft = async () => {
    if (!isHost()) {
      setError("Only the host can start the draft");
      return;
    }

    const remaining = timeRemaining();
    if (remaining !== null && remaining > 0) {
      setError("Cannot start draft before the scheduled start time");
      return;
    }

    setIsStarting(true);
    setError("");

    try {
      await startDraft({ draftId });
      navigate({ to: "/draft/$id/during", params: { id: draftId } });
    } catch (err) {
      console.error("Failed to start draft:", err);
      setError(err instanceof Error ? err.message : "Failed to start draft");
      setIsStarting(false);
    }
  };

  const currentUserId = () => session()?.data?.user?.id;

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-8">
      <div class="max-w-6xl mx-auto">
        {/* Header */}
        <Show when={draft?.()}>
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8 mb-6">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h1 class="text-4xl font-bold text-white mb-2">
                  {draft()!.name}
                </h1>
                <div class="flex items-center gap-4 text-slate-300">
                  <span>📅 {formatDate(draft()!.startDatetime)}</span>
                  <span>•</span>
                  <span>👥 {teams?.()?.length || 0} {teams?.()?.length === 1 ? "team" : "teams"} joined</span>
                </div>
              </div>
              <span class="px-4 py-2 bg-yellow-600/20 text-yellow-300 rounded-lg font-medium border border-yellow-600/30">
                Pre-Draft
              </span>
            </div>

            {/* Countdown */}
            <div class="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-700/30 mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-green-300 text-sm font-medium mb-1">Draft Starts In</p>
                  <p class="text-3xl font-bold text-white">
                    {timeRemaining() !== null ? formatTimeRemaining(timeRemaining()!) : "Loading..."}
                  </p>
                </div>
                <div class="text-6xl">⏰</div>
              </div>
            </div>
          </div>
        </Show>

        {/* Error Message */}
        <Show when={error()}>
          <div class="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6">
            <p class="text-red-300 text-sm">{error()}</p>
          </div>
        </Show>

        {/* Teams List */}
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8 mb-6">
          <h2 class="text-2xl font-bold text-white mb-6">
            Draft Order & Teams ({teams?.()?.length || 0})
          </h2>
          <Show
            when={teams?.() && teams()!.length > 0}
            fallback={
              <div class="text-center py-8 text-slate-400">
                <p>No teams have joined yet. Share the invite link above!</p>
              </div>
            }
          >
            <div class="space-y-3">
              <For each={teams?.() || []}>
                {(team) => {
                  const isCurrentUser = () => currentUserId() === team.betterAuthUserId;
                  return (
                    <div
                      class={`flex items-center justify-between p-4 rounded-lg border ${"bg-slate-900/50 border-slate-600"
                        } ${isCurrentUser() ? "ring-2 ring-green-500/50" : ""}`}
                    >
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 flex items-center justify-center bg-slate-700 rounded-full text-white font-bold">
                          {team.draftOrderNumber}
                        </div>
                        <div>
                          <div class="flex items-center gap-2">
                            <p class="text-white font-semibold">{team.teamName}</p>
                            {isCurrentUser() && (
                              <span class="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">
                                You
                              </span>
                            )}
                          </div>
                          <p class="text-slate-400 text-sm">Joined</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        {/* Logged in indicator - simplified for now */}
                        <div class="flex items-center gap-1">
                          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span class="text-green-400 text-xs">Online</span>
                        </div>
                        <span class="text-green-400 text-sm">✓ Joined</span>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>

        {/* Action Buttons */}
        <div class="flex gap-4">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            Back to Dashboard
          </button>
          <Show when={isHost()}>
            <button
              onClick={handleStartDraft}
              disabled={isStarting() || (timeRemaining() !== null && timeRemaining()! > 0)}
              class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-500/30"
            >
              {isStarting()
                ? "Starting..."
                : timeRemaining() !== null && timeRemaining()! > 0
                  ? `Start Draft (${formatTimeRemaining(timeRemaining()!)})`
                  : "Start Draft →"}
            </button>
          </Show>
          <Show when={!isHost()}>
            <div class="flex-1 px-6 py-3 bg-slate-700/50 text-slate-400 rounded-lg text-center">
              Waiting for host to start the draft...
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
