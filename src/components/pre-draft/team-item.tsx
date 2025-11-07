import { Show } from "solid-js";

export type TeamItemProps = {
  team: {
    draftOrderNumber: number;
    teamName: string;
    betterAuthUserId: string;
  };
  currentUserId: string | undefined;
  isOnline: boolean;
};

export default function TeamItem(props: TeamItemProps) {
  const isCurrentUser = () =>
    props.currentUserId === props.team.betterAuthUserId;

  return (
    <div
      class={`flex items-center justify-between p-4 rounded-lg border bg-slate-900/50 border-slate-600 ${isCurrentUser() ? "ring-2 ring-green-500/50" : ""
        }`}
    >
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 flex items-center justify-center bg-slate-700 rounded-full text-white font-bold">
          {props.team.draftOrderNumber}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <p class="text-white font-semibold">{props.team.teamName}</p>
            {isCurrentUser() && (
              <span class="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                Your Team
              </span>
            )}
          </div>
          <p class="text-slate-400 text-sm">Joined</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Show
          when={props.isOnline}
          fallback={
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 bg-slate-500 rounded-full"></div>
              <span class="text-slate-400 text-xs">Offline</span>
            </div>
          }
        >
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-green-400 text-xs">Online</span>
          </div>
        </Show>
      </div>
    </div>
  );
}

