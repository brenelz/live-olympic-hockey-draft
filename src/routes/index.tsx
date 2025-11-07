import { createFileRoute, redirect } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { SignIn } from "~/components/sign-in";
import { SignUp } from "~/components/sign-up";

export const Route = createFileRoute("/")({
  beforeLoad: async (ctx) => {
    if (ctx.context.token && ctx.context.session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: App,
});

function App() {
  const [isSignUp, setIsSignUp] = createSignal(false);

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div class="text-center mb-8">
            <div class="inline-block p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl mb-4">
              <svg
                class="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                {/* Hockey puck icon */}
                <ellipse cx="12" cy="8" rx="9" ry="3" opacity="0.3" />
                <path d="M21 8c0 1.657-4.03 3-9 3S3 9.657 3 8s4.03-3 9-3 9 1.343 9 3z" />
                <path
                  d="M3 8v8c0 1.657 4.03 3 9 3s9-1.343 9-3V8c0 1.657-4.03 3-9 3s-9-1.343-9-3z"
                  opacity="0.8"
                />
                <path d="M21 16c0 1.657-4.03 3-9 3s-9-1.343-9-3" />
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-slate-900 mb-2">
              Live Olympic Hockey Draft
            </h1>
            <p class="text-slate-600 text-sm">
              <Show
                when={isSignUp()}
                fallback={<span>Welcome back! Please sign in</span>}
              >
                <span>Create your account to get started</span>
              </Show>
            </p>
          </div>

          {/* Form */}
          <Show when={isSignUp()} fallback={<SignIn />}>
            <SignUp />
          </Show>

          {/* Toggle between sign in/sign up */}
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-slate-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp())}
              class="cursor-pointer w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all py-2 mt-4"
            >
              <Show
                when={isSignUp()}
                fallback={<span>Don't have an account? Sign up</span>}
              >
                <span>Already have an account? Sign in</span>
              </Show>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p class="text-center text-sm text-slate-400 mt-6">
          Secure authentication powered by Better Auth
        </p>
      </div>
    </div>
  );
}
