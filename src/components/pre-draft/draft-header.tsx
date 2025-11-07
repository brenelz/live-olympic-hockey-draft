import { formatDate } from "~/lib/utils";
import type { Id } from "convex/_generated/dataModel";

type Draft = {
  _id: Id<"drafts">;
  name: string;
  startDatetime: number;
};

export type DraftHeaderProps = {
  draft: Draft;
  teamCount: number;
};

export default function DraftHeader(props: DraftHeaderProps) {
  return (
    <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-8 mb-6">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">{props.draft.name}</h1>
          <div class="flex items-center gap-4 text-slate-300">
            <span>📅 {formatDate(props.draft.startDatetime)}</span>
            <span>•</span>
            <span>
              👥 {props.teamCount}{" "}
              {props.teamCount === 1 ? "team" : "teams"} joined
            </span>
          </div>
        </div>
        <span class="px-4 py-2 bg-yellow-600/20 text-yellow-300 text-sm rounded-lg font-medium border border-yellow-600/30">
          Pre-Draft
        </span>
      </div>
    </div>
  );
}

