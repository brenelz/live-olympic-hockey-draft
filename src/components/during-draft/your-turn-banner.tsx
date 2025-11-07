import { Show } from "solid-js";

interface YourTurnBannerProps {
    isMyTurn: boolean;
    timeRemaining: number;
}

export function YourTurnBanner(props: YourTurnBannerProps) {
    return (
        <Show when={props.isMyTurn}>
            <div class="bg-gradient-to-r from-green-600/40 to-emerald-600/40 rounded-lg p-4 border-2 border-green-500/50 mb-6 animate-pulse">
                <div class="flex items-center justify-center gap-3">
                    <div class="text-3xl">⏰</div>
                    <div>
                        <p class="text-xl font-bold text-white">
                            It's Your Turn to Pick!
                        </p>
                        <p class="text-green-200 text-sm">
                            You have {props.timeRemaining} seconds remaining
                        </p>
                    </div>
                </div>
            </div>
        </Show>
    );
}

