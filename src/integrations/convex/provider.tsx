import { setupConvex, ConvexProvider } from "convex-solidjs";
import type { JSXElement } from "solid-js";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("missing envar CONVEX_URL");
}

// Set up Convex client with auth
export const convexClient = setupConvex(CONVEX_URL);

// Configure auth token fetcher
convexClient.setAuth(async () => {
  try {
    // Fetch the Convex token from Better Auth
    const response = await fetch("/api/auth/convex/token", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error("Failed to fetch Convex token:", error);
    return null;
  }
});

export default function AppConvexProvider(props: { children: JSXElement }) {
  return (
    <ConvexProvider client={convexClient}>{props.children}</ConvexProvider>
  );
}
