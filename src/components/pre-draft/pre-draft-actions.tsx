import { useNavigate } from "@tanstack/solid-router";
import { useMutation } from "convex-solidjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { createSignal, Show } from "solid-js";
import ErrorMessage from "../error-message";

export type PreDraftActionsProps = {
  isHost: boolean;
  timeRemaining: number | null;
  draftId: Id<"drafts">;
};

export default function PreDraftActions(props: PreDraftActionsProps) {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = createSignal(false);
  const [error, setError] = createSignal("");

  const { mutate: startDraft } = useMutation(api.drafts.startDraft);
  const { mutate: randomizeDraftTeams } = useMutation(
    api.draftTeams.randomizeDraftTeams
  );

  const handleRandomizeDraftTeams = async () => {
    if (!props.isHost) {
      setError("Only the host can randomize the draft");
      return;
    }
    await randomizeDraftTeams({ draftId: props.draftId });
  };

  const handleStartDraft = async () => {
    if (!props.isHost) {
      setError("Only the host can start the draft");
      return;
    }

    setIsStarting(true);
    setError("");

    try {
      await startDraft({ draftId: props.draftId });
      navigate({ to: "/draft/$id/during", params: { id: props.draftId } });
    } catch (err) {
      console.error("Failed to start draft:", err);
      setError(err instanceof Error ? err.message : "Failed to start draft");
      setIsStarting(false);
    }
  };


  return (
    <>
      <ErrorMessage error={error()} />

      <div class="flex gap-4">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
        >
          Back to Dashboard
        </button>
        <Show when={props.isHost}>
          <button
            onClick={handleRandomizeDraftTeams}
            class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-500/30"
          >
            Randomize Order
          </button>
          <button
            onClick={handleStartDraft}
            disabled={
              isStarting()
            }
            class="cursor-pointer flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-500/30"
          >
            {isStarting()
              ? "Starting..."
              : "Start Draft →"}
          </button>
        </Show>
        <Show when={!props.isHost}>
          <div class="flex-1 px-6 py-3 bg-slate-700/50 text-slate-400 rounded-lg text-center">
            Waiting for host to start the draft...
          </div>
        </Show>
      </div>
    </>
  );
}

