import { Link, useNavigate } from "@tanstack/solid-router";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { createSignal, Show } from "solid-js";

export function Header() {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = createSignal(false);
  const session = authClient.useSession();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      navigate({ to: "/" });
    } catch (err) {
      console.error("Sign out error:", err);
      setIsSigningOut(false);
    }
  };

  return (
    <header class="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <Link
            to="/dashboard"
            class="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div class="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
              <svg class="w-6 h-6" fill="white" viewBox="0 0 24 24">
                {/* Hockey puck icon */}
                <ellipse
                  cx="12"
                  cy="8"
                  rx="9"
                  ry="3"
                  fill="white"
                  opacity="0.3"
                />
                <path
                  d="M21 8c0 1.657-4.03 3-9 3S3 9.657 3 8s4.03-3 9-3 9 1.343 9 3z"
                  fill="white"
                />
                <path
                  d="M3 8v8c0 1.657 4.03 3 9 3s9-1.343 9-3V8c0 1.657-4.03 3-9 3s-9-1.343-9-3z"
                  fill="white"
                  opacity="0.8"
                />
                <path d="M21 16c0 1.657-4.03 3-9 3s-9-1.343-9-3" fill="white" />
              </svg>
            </div>
            <h1 class="text-xl font-bold text-white">
              Live Olympic Hockey Draft
            </h1>
          </Link>
          <Show when={session()?.data?.user}>
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium text-white">
                  {session()?.data?.user.name}
                </p>
                <p class="text-xs text-slate-300">
                  {session()?.data?.user.email}
                </p>
              </div>
              {/* User Avatar */}
              <div class="relative">
                {session()?.data?.user.image ? (
                  <img
                    src={session()?.data?.user.image ?? ""}
                    alt={session()?.data?.user.name ?? "User"}
                    class="w-10 h-10 rounded-full border-2 border-white/30 bg-slate-700 object-cover"
                  />
                ) : (
                  <div class="w-10 h-10 rounded-full border-2 border-white/30 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">
                      {session()?.data?.user.name?.charAt(0).toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut()}
                variant="outline"
                class="cursor-pointer bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                {isSigningOut() ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
