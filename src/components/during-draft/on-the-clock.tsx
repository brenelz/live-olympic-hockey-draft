import { Show } from "solid-js";
import type { Accessor } from "solid-js";

interface OnTheClockProps {
    currentPickData: Accessor<{
        team: { teamName: string };
        pickNumber: number;
    } | undefined>;
    isMyTurn: boolean;
    timeRemaining: number;
}

export function OnTheClock(props: OnTheClockProps) {
    return (
        <Show
            when={props.currentPickData()}
            fallback={
                <div class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
                    <p class="text-white">Loading...</p>
                </div>
            }
        >
            {(pick) => {
                return (
                    <div
                        class={`rounded-lg p-4 border ${props.isMyTurn
                            ? "bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-green-500/50 ring-2 ring-green-500/50"
                            : "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30"
                            }`}
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <p class="text-sm text-slate-300">ON THE CLOCK</p>
                                    {props.isMyTurn && (
                                        <span class="px-2 py-0.5 bg-green-500/30 text-green-300 text-xs font-bold rounded-full border border-green-500/50 animate-pulse">
                                            YOUR TURN
                                        </span>
                                    )}
                                </div>
                                <p class="text-2xl font-bold text-white">
                                    {pick().team.teamName}
                                </p>
                                <p class="text-slate-400 text-sm">
                                    Pick #{pick().pickNumber}
                                </p>
                            </div>
                            <div class="text-center">
                                <div
                                    class={`text-4xl font-bold ${props.timeRemaining <= 10
                                        ? "text-red-400"
                                        : props.isMyTurn
                                            ? "text-green-300"
                                            : "text-white"
                                        }`}
                                >
                                    {props.timeRemaining}s
                                </div>
                                <p class="text-slate-400 text-sm">remaining</p>
                            </div>
                        </div>
                    </div>
                );
            }}
        </Show>
    );
}

