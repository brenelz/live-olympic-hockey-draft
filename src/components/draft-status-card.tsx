import type { JSX } from "solid-js";

interface DraftStatusCardProps {
    title: string;
    count: number;
    description: string;
    icon: JSX.Element;
    iconBgClass: string;
    iconBorderClass: string;
    iconColorClass: string;
}

export function DraftStatusCard(props: DraftStatusCardProps) {
    return (
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-slate-700">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-white">{props.title}</h3>
                <div class={`p-2 ${props.iconBgClass} rounded-lg border ${props.iconBorderClass} ${props.iconColorClass}`}>
                    {props.icon}
                </div>
            </div>
            <p class="text-3xl font-bold text-white">{props.count}</p>
            <p class="text-sm text-slate-300 mt-2">{props.description}</p>
        </div>
    );
}

