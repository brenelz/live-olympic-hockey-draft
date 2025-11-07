import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import {
  createSignal,
  Show,
  onMount,
  onCleanup,
  createMemo,
} from "solid-js";
import { useQuery, useMutation } from "convex-solidjs";
import { api } from "../../../../../convex/_generated/api";
import { authClient } from "~/lib/auth-client";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Header } from "~/components/header";
import { formatTimeRemaining } from "~/lib/utils";
import DraftHeader from "~/components/pre-draft/draft-header";
import CountdownTimer from "~/components/pre-draft/countdown-timer";
import ShareLink from "~/components/pre-draft/share-link";
import TeamsList from "~/components/pre-draft/teams-list";
import PreDraftActions from "~/components/pre-draft/pre-draft-actions";
import ErrorMessage from "~/components/error-message";

export const Route = createFileRoute("/_authed/draft/$id/pre")({
  component: PreDraft,
});

function PreDraft() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = createSignal<number | null>(null);
  const [isStarting, setIsStarting] = createSignal(false);
  const [error, setError] = createSignal("");

  const draftId = params().id as Id<"drafts">;
  const session = authClient.useSession();

  // Fetch draft data
  const { data: draft } = useQuery(api.drafts.getDraftById, { draftId });
  const { data: teams } = useQuery(api.draftTeams.getDraftTeams, { draftId });
  const { data: onlineUsers } = useQuery(api.draftPresence.getOnlineUsers, {
    draftId,
  });

  // Start draft mutation
  const { mutate: startDraft } = useMutation(api.drafts.startDraft);
  const { mutate: updatePresence } = useMutation(api.draftPresence.updatePresence);
  const { mutate: removePresence } = useMutation(api.draftPresence.removePresence);
  const { mutate: randomizeDraftTeams } = useMutation(
    api.draftTeams.randomizeDraftTeams
  );

  const currentUserId = () => session()?.data?.user?.id;

  // Check if current user is host
  const isHost = (): boolean => {
    const user = session()?.data?.user;
    return !!(
      user &&
      draft?.() &&
      draft()!.hostBetterAuthUserId &&
      draft()!.hostBetterAuthUserId === user.id
    );
  };

  // Check if current user is part of the draft
  const isPartOfDraft = createMemo(() => {
    const userId = currentUserId();
    if (!userId || !teams?.()) return false;
    return teams()!.some((team) => team.betterAuthUserId === userId);
  });

  // Redirect to join page if user is not part of the draft
  const shouldRedirectToJoin = createMemo(() => {
    const draftData = draft?.();
    const teamsData = teams?.();
    // Only redirect if draft and teams are loaded, and user is not host and not part of draft
    return (
      draftData && teamsData !== undefined && !isHost() && !isPartOfDraft()
    );
  });

  // Redirect non-hosts when draft status changes to DURING
  const shouldRedirect = createMemo(() => {
    return !isHost() && draft?.() && draft()!.status === "DURING";
  });

  // Check if all data is loaded
  const isDataReady = createMemo(() => {
    return (
      draft?.() !== undefined &&
      teams?.() !== undefined &&
      session()?.data?.user !== undefined
    );
  });

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

    // Update presence heartbeat every 10 seconds
    const updatePresenceHeartbeat = () => {
      updatePresence({ draftId });
    };

    // Update immediately and then every 10 seconds
    updatePresenceHeartbeat();
    const presenceInterval = setInterval(updatePresenceHeartbeat, 10000);

    onCleanup(() => {
      clearInterval(interval);
      clearInterval(presenceInterval);
      // Remove presence when component unmounts (user navigates away)
      removePresence({ draftId }).catch(() => {
        // Ignore errors - user might have already been removed
      });
    });
  });

  const handleRandomizeDraftTeams = async () => {
    if (!isHost()) {
      setError("Only the host can randomize the draft");
      return;
    }
    await randomizeDraftTeams({ draftId });
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

  const getShareLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/draft/join?id=${draftId}`;
  };

  // Redirect component that handles navigation to join page
  const RedirectToJoin = () => {
    onMount(() => {
      navigate({ to: "/draft/join", search: { id: draftId } });
    });
    return null;
  };

  // Redirect component that handles navigation to during page
  const RedirectToDuring = () => {
    onMount(() => {
      navigate({ to: "/draft/$id/during", params: { id: draftId } });
    });
    return null;
  };

  return (
    <>
      <Show when={shouldRedirectToJoin()}>
        <RedirectToJoin />
      </Show>
      <Show when={shouldRedirect()}>
        <RedirectToDuring />
      </Show>
      <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800">
        <Header />

        <Show when={!shouldRedirectToJoin() && !shouldRedirect()}>
          <div class="p-8">
            <div class="max-w-6xl mx-auto">
              {/* Main Content - Only show when data is ready */}
              <Show when={isDataReady()} fallback={<div class="flex flex-col items-center justify-center min-h-[60vh]">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
                <p class="text-slate-300 text-lg font-medium">Loading draft...</p>
              </div>}>
                <Show when={draft?.() && teams?.()}>
                  <DraftHeader
                    draft={draft()!}
                    teamCount={teams()!.length}
                  />
                  <CountdownTimer
                    timeRemaining={timeRemaining()}
                    formatTimeRemaining={formatTimeRemaining}
                  />
                  <ShareLink shareLink={getShareLink()} />
                </Show>

                <ErrorMessage error={error()} />

                <TeamsList
                  teams={teams?.()}
                  currentUserId={currentUserId()}
                  onlineUsers={onlineUsers?.()}
                />

                <PreDraftActions
                  isHost={isHost()}
                  isStarting={isStarting()}
                  timeRemaining={timeRemaining()}
                  formatTimeRemaining={formatTimeRemaining}
                  onBackToDashboard={() => navigate({ to: "/dashboard" })}
                  onRandomize={handleRandomizeDraftTeams}
                  onStartDraft={handleStartDraft}
                />
              </Show>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
}
