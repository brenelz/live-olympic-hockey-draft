export function WaitingMessage() {
    return (
        <div class="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6 flex items-center justify-center">
            <div class="text-center">
                <div class="text-6xl mb-4">⏳</div>
                <p class="text-xl font-bold text-white mb-2">Waiting for Your Turn</p>
                <p class="text-slate-400">
                    The player selection will appear when it's your turn to pick.
                </p>
            </div>
        </div>
    );
}

