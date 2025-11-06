import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/solid-router";
import { createSignal, Show, createMemo, createEffect } from "solid-js";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
  beforeLoad: async (ctx) => {
    if (ctx.context.session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: App,
});

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  general?: string;
}

function App() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [name, setName] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [errors, setErrors] = createSignal<ValidationErrors>({});
  const [isSignUp, setIsSignUp] = createSignal(false);
  const [touched, setTouched] = createSignal({ email: false, password: false, name: false });
  const [showPassword, setShowPassword] = createSignal(false);


  // Email validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  // Password validation
  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    return undefined;
  };

  // Name validation for signup
  const validateName = (name: string): string | undefined => {
    if (isSignUp() && !name) return "Name is required";
    if (isSignUp() && name.length < 2) return "Name must be at least 2 characters";
    return undefined;
  };

  // Real-time validation as user types (only after field is touched)
  createEffect(() => {
    const currentErrors: ValidationErrors = {};

    if (touched().email && email()) {
      const emailError = validateEmail(email());
      if (emailError) currentErrors.email = emailError;
    }

    if (touched().password && password()) {
      const passwordError = validatePassword(password());
      if (passwordError) currentErrors.password = passwordError;
    }

    if (touched().name && isSignUp()) {
      const nameError = validateName(name());
      if (nameError) currentErrors.name = nameError;
    }

    setErrors(currentErrors);
  });

  const handleAuth = async (e: Event) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true, name: true });

    // Validate all fields
    const emailError = validateEmail(email());
    const passwordError = validatePassword(password());
    const nameError = isSignUp() ? validateName(name()) : undefined;

    if (emailError || passwordError || nameError) {
      setErrors({
        email: emailError,
        password: passwordError,
        name: nameError,
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isSignUp()) {
        const res = await authClient.signUp.email({
          email: email(),
          password: password(),
          name: name() || email().split("@")[0],
        });
        if (res.error) {
          setErrors({ general: res.error.message });
        }

        setIsSignUp(false);

        return redirect({ to: "/" });
      } else {
        const res = await authClient.signIn.email({
          email: email(),
          password: password(),
        });
        if (res.error) {
          setErrors({ general: "Invalid email or password. Please check your credentials and try again." });
        }
        return navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      console.error("Authentication error:", err);

      // Provide specific error messages based on error type
      let errorMessage = "Authentication failed. Please try again.";

      if (err.message) {
        errorMessage = err.message;
      } else if (err.error) {
        errorMessage = err.error;
      } else if (err.statusText) {
        errorMessage = err.statusText;
      }

      // Provide helpful context for common errors
      if (errorMessage.toLowerCase().includes("user not found") ||
        errorMessage.toLowerCase().includes("invalid credentials")) {
        errorMessage = isSignUp()
          ? "Unable to create account. Please check your information and try again."
          : "Invalid email or password. Please check your credentials and try again.";
      } else if (errorMessage.toLowerCase().includes("already exists")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (errorMessage.toLowerCase().includes("network") ||
        errorMessage.toLowerCase().includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp());
    setErrors({});
    setTouched({ email: false, password: false, name: false });
  };

  const isFormValid = createMemo(() => {
    const emailValid = !validateEmail(email());
    const passwordValid = !validatePassword(password());
    const nameValid = !isSignUp() || !validateName(name());
    return emailValid && passwordValid && nameValid;
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div class="text-center mb-8">
            <div class="inline-block p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl mb-4">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                {/* Hockey puck icon */}
                <ellipse cx="12" cy="8" rx="9" ry="3" opacity="0.3" />
                <path d="M21 8c0 1.657-4.03 3-9 3S3 9.657 3 8s4.03-3 9-3 9 1.343 9 3z" />
                <path d="M3 8v8c0 1.657 4.03 3 9 3s9-1.343 9-3V8c0 1.657-4.03 3-9 3s-9-1.343-9-3z" opacity="0.8" />
                <path d="M21 16c0 1.657-4.03 3-9 3s-9-1.343-9-3" />
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-slate-900 mb-2">
              Live Olympic Hockey Draft
            </h1>
            <p class="text-slate-600 text-sm">
              {isSignUp() ? "Create your account to get started" : "Welcome back! Please sign in"}
            </p>
          </div>

          <div>
            <form onSubmit={handleAuth} class="space-y-5">
              {/* Name field (only for signup) */}
              <Show when={isSignUp()}>
                <div>
                  <label
                    for="name"
                    class="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                    onBlur={() => setTouched({ ...touched(), name: true })}
                    class={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors().name && touched().name
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300 bg-white"
                      }`}
                    placeholder="John Doe"
                  />
                  <Show when={errors().name && touched().name}>
                    <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      {errors().name}
                    </p>
                  </Show>
                </div>
              </Show>

              {/* Email field */}
              <div>
                <label
                  for="email"
                  class="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  onBlur={() => setTouched({ ...touched(), email: true })}
                  class={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors().email && touched().email
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-white"
                    }`}
                  placeholder="you@example.com"
                  autocomplete="email"
                />
                <Show when={errors().email && touched().email}>
                  <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    {errors().email}
                  </p>
                </Show>
              </div>

              {/* Password field */}
              <div>
                <label
                  for="password"
                  class="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Password
                </label>
                <div class="relative">
                  <input
                    id="password"
                    type={showPassword() ? "text" : "password"}
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    onBlur={() => setTouched({ ...touched(), password: true })}
                    class={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 ${errors().password && touched().password
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300 bg-white"
                      }`}
                    placeholder="••••••••"
                    autocomplete={isSignUp() ? "new-password" : "current-password"}
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
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      }
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    </Show>
                  </button>
                </div>

                <Show when={errors().password && touched().password}>
                  <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    {errors().password}
                  </p>
                </Show>
              </div>

              {/* General error */}
              <Show when={errors().general}>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <h3 class="text-sm font-semibold text-red-800">Authentication Error</h3>
                    <p class="text-sm text-red-700 mt-1">{errors().general}</p>
                  </div>
                </div>
              </Show>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading() || !isFormValid()}
                class="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all"
              >
                <Show
                  when={!isLoading()}
                  fallback={
                    <div class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{isSignUp() ? "Creating account..." : "Signing in..."}</span>
                    </div>
                  }
                >
                  {isSignUp() ? "Create Account" : "Sign In"}
                </Show>
              </Button>

              {/* Toggle between sign in/sign up */}
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
                onClick={switchMode}
                class="cursor-pointer w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all py-2"
              >
                {isSignUp()
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </form>
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
