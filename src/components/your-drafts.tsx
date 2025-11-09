import { Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import type { fetchUserDrafts } from "~/lib/server";
import { Button } from "~/components/ui/button";
import DraftCard from "~/components/draft-card";

export type YourDraftsProps = {
    drafts: Awaited<ReturnType<typeof fetchUserDrafts>>;
};

export default function YourDrafts(props: YourDraftsProps) {
    return (
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
            <h3 class="text-2xl font-bold text-white mb-6">Your Drafts</h3>
            <Show
                when={props.drafts && props.drafts.length > 0}
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
                        <p class="text-xl font-medium mb-2 text-white">No drafts yet</p>
                        <p class="text-sm mb-6">
                            Create a new draft or join an existing one to get started!
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
                    <For each={props.drafts ?? []}>
                        {(draft) => <DraftCard draft={draft} />}
                    </For>
                </div>
            </Show>
        </div>
    );
}
