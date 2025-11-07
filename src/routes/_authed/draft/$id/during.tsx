import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { useMutation, useQuery } from "convex-solidjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import {
  Show,
  createSignal,
  onMount,
  onCleanup,
  createEffect,
  createMemo,
} from "solid-js";
import { Header } from "~/components/header";
import { authClient } from "~/lib/auth-client";
import { DraftHeader } from "~/components/during-draft/draft-header";
import { OnTheClock } from "~/components/during-draft/on-the-clock";
import { YourTurnBanner } from "~/components/during-draft/your-turn-banner";
import { PlayerSelection } from "~/components/during-draft/player-selection";
import { RecentPicks } from "~/components/during-draft/recent-picks";
import { DraftStats } from "~/components/during-draft/draft-stats";

export const Route = createFileRoute("/_authed/draft/$id/during")({
  component: DuringDraft,
});

function DuringDraft() {
  const params = Route.useParams();
  const id = () => params().id;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedPlayer, setSelectedPlayer] =
    createSignal<Id<"draftablePlayers"> | null>(null);

  const session = authClient.useSession();
  const draftId = id() as Id<"drafts">;
  const { data: draft } = useQuery(api.drafts.getDraftById, { draftId });
  const { data: currentPickData } = useQuery(api.draftPicks.getCurrentPick, {
    draftId,
  });
  const { data: availablePlayers } = useQuery(api.draftPicks.getAvailablePlayers, {
    draftId,
  });

  const { mutate: finishDraft } = useMutation(api.drafts.finishDraft);
  const { mutate: advancePick } = useMutation(api.draftPicks.advancePick);
  const { mutate: makePickMutation } = useMutation(api.draftPicks.makePick);
  const [timeRemaining, setTimeRemaining] = createSignal<number>(45);
  const [hasAdvanced, setHasAdvanced] = createSignal<boolean>(false);
  const [isMakingPick, setIsMakingPick] = createSignal<boolean>(false);

  const currentUserId = () => session()?.data?.user?.id;

  const isMyTurn = (): boolean => {
    const pick = currentPickData?.();
    const userId = currentUserId();
    return !!(pick && userId && pick.team.betterAuthUserId === userId);
  };

  // Redirect to post page if draft is complete
  const shouldRedirectToPost = createMemo(() => {
    const draftData = draft?.();
    return draftData && draftData.status === "POST";
  });

  // Countdown timer and auto-advance
  onMount(() => {
    const updateCountdown = async () => {
      // Don't auto-advance if a pick is being made
      if ((currentPickData?.()?.round ?? 0) >= 7) {
        await handleFinishDraft();
        return;
      }
      if (isMakingPick()) return;

      const pick = currentPickData?.();
      if (pick && pick.startTime) {
        const now = Date.now();
        const elapsed = now - pick.startTime;
        const remaining = Math.max(0, 45000 - elapsed); // 45 seconds
        setTimeRemaining(Math.floor(remaining / 1000));

        // Auto-advance if time is up (only once per pick)
        if (remaining <= 0 && !hasAdvanced()) {
          setHasAdvanced(true);
          advancePick({ draftId }).catch((err) => {
            console.error("Failed to advance pick:", err);
            setHasAdvanced(false); // Reset on error so it can retry
          });
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);

    onCleanup(() => clearInterval(interval));
  });

  // Reset countdown and advance flag when pick changes
  createEffect(() => {
    const pick = currentPickData?.();
    if (pick && pick.startTime) {
      setHasAdvanced(false); // Reset advance flag for new pick
      const now = Date.now();
      const elapsed = now - pick.startTime;
      const remaining = Math.max(0, 45000 - elapsed);
      setTimeRemaining(Math.floor(remaining / 1000));
    }
  });

  const makePick = async () => {
    const playerId = selectedPlayer();
    if (!playerId) return;

    // Prevent multiple simultaneous picks
    if (isMakingPick()) {
      return;
    }

    setIsMakingPick(true);
    try {
      await makePickMutation({
        draftId,
        playerId,
      });
      setSelectedPlayer(null);
      // Reset advance flag since we just made a pick
      setHasAdvanced(false);
    } catch (err) {
      console.error("Failed to make pick:", err);
      alert(err instanceof Error ? err.message : "Failed to make pick");
    } finally {
      setIsMakingPick(false);
    }
  };

  // Filter players by search query
  const filteredPlayers = () => {
    const players = availablePlayers?.() || [];
    const query = searchQuery().toLowerCase();
    if (!query) return players;
    return players.filter(
      (player) =>
        player.name.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query)
    );
  };

  const handleFinishDraft = async () => {
    await finishDraft({ draftId: id() as Id<"drafts"> });
    navigate({ to: "/draft/$id/post", params: { id: id() } });
  };

  // Redirect component that handles navigation to post page
  const RedirectToPost = () => {
    onMount(() => {
      navigate({ to: "/draft/$id/post", params: { id: id() } });
    });
    return null;
  };

  return (
    <>
      <Show when={shouldRedirectToPost()}>
        <RedirectToPost />
      </Show>
      <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800">
        <Header />
        <div class="p-6">
          <div class="max-w-7xl mx-auto">
            <DraftHeader
              draftName={draft?.()?.name}
              currentPickData={() => {
                const pick = currentPickData?.();
                return pick ? { round: pick.round, pickNumber: pick.pickNumber } : undefined;
              }}
            />

            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6 mb-6">
              <OnTheClock
                currentPickData={() => {
                  const pick = currentPickData?.();
                  return pick ? { team: { teamName: pick.team.teamName }, pickNumber: pick.pickNumber } : undefined;
                }}
                isMyTurn={isMyTurn()}
                timeRemaining={timeRemaining()}
              />

              <YourTurnBanner isMyTurn={isMyTurn()} timeRemaining={timeRemaining()} />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PlayerSelection
                isMyTurn={isMyTurn()}
                searchQuery={searchQuery}
                onSearchInput={setSearchQuery}
                filteredPlayers={filteredPlayers}
                selectedPlayer={selectedPlayer}
                onSelectPlayer={setSelectedPlayer}
                isMakingPick={isMakingPick}
                onMakePick={makePick}
              />

              <div class="space-y-6">
                <RecentPicks draftId={draftId} />
                <DraftStats draftId={draftId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
