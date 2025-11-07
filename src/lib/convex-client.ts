import { setupConvex } from "convex-solidjs";
import { fetchAuth } from "~/lib/server";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("missing envar CONVEX_URL");
}

// Set up Convex client with auth
export const convexClient = setupConvex(CONVEX_URL);

// Configure auth token fetcher
convexClient.setAuth(async () => {
  const auth = await convexClient.getAuth();
  if (!auth) {
    const { token } = await fetchAuth();
    return token;
  }
  return auth.token;
});
