import { createSignal, Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";

export function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    const [showPassword, setShowPassword] = createSignal(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError("");

        if (!email() || !password()) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const res = await authClient.signIn.email({
                email: email(),
                password: password(),
            });

            if (res.error) {
                setError("Invalid email or password");
                return;
            }

            navigate({ to: "/dashboard" });
        } catch (err: any) {
            setError("Sign in failed. Please try again.");
            console.error("Sign in error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} class="space-y-5">
            <div>
                <label for="email" class="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    placeholder="you@example.com"
                    autocomplete="email"
                    required
                />
            </div>

            <div>
                <label for="password" class="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                </label>
                <div class="relative">
                    <input
                        id="password"
                        type={showPassword() ? "text" : "password"}
                        value={password()}
                        onInput={(e) => setPassword(e.currentTarget.value)}
                        class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 bg-white"
                        placeholder="••••••••"
                        autocomplete="current-password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword())}
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <Show
                            when={showPassword()}
                            fallback={
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            }
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                            </svg>
                        </Show>
                    </button>
                </div>
            </div>

            <Show when={error()}>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    {error()}
                </div>
            </Show>

            <Button
                type="submit"
                disabled={isLoading()}
                class="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
            >
                <Show
                    when={!isLoading()}
                    fallback={
                        <div class="flex items-center justify-center gap-2">
                            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle
                                    class="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    stroke-width="4"
                                />
                                <path
                                    class="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <span>Signing in...</span>
                        </div>
                    }
                >
                    Sign In
                </Show>
            </Button>
        </form>
    );
}

