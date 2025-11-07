interface PlayerSearchProps {
    searchQuery: () => string;
    onInput: (value: string) => void;
}

export function PlayerSearch(props: PlayerSearchProps) {
    return (
        <div class="mb-4">
            <input
                type="text"
                value={props.searchQuery()}
                onInput={(e) => props.onInput(e.currentTarget.value)}
                placeholder="Search players..."
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

