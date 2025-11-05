import { createFileRoute, useRouter } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const loaderData = Route.useLoaderData();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [isSignUp, setIsSignUp] = createSignal(false);
  const session = authClient.useSession();

  const handleAuth = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp()) {
        await authClient.signUp.email({
          email: email(),
          password: password(),
          name: email().split("@")[0], // Use part of email as name
        });
      } else {
        await authClient.signIn.email({
          email: email(),
          password: password(),
        });
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <div class="bg-white rounded-lg shadow-xl p-8">
          <h1 class="text-3xl font-bold text-center mb-6 text-slate-900">
            Live Olympic Hockey Draft
          </h1>

          <Show
            when={session().data?.session}
            fallback={
              <div>
                <form onSubmit={handleAuth} class="space-y-4">
                  <div>
                    <label
                      for="email"
                      class="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email()}
                      onInput={(e) => setEmail(e.currentTarget.value)}
                      required
                      class="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label
                      for="password"
                      class="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password()}
                      onInput={(e) => setPassword(e.currentTarget.value)}
                      required
                      class="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <Show when={error()}>
                    <div class="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                      {error()}
                    </div>
                  </Show>

                  <Button type="submit" disabled={isLoading()} class="w-full">
                    {isLoading()
                      ? "Loading..."
                      : isSignUp()
                        ? "Sign Up"
                        : "Sign In"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp())}
                    class="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {isSignUp()
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </button>
                </form>
              </div>
            }
          >
            <div class="text-center space-y-4">
              <p class="text-lg text-slate-700">Welcome, {session().data?.user?.name}!</p>
              <Button onClick={handleSignOut} variant="outline" class="w-full">
                Sign Out
              </Button>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
