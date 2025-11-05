import {
  fetchSession,
  getCookieName,
} from "@convex-dev/better-auth/react-start";
import { createServerFn } from "@tanstack/solid-start";
import { getCookie, getRequest } from "@tanstack/solid-start/server";

// Get auth information for SSR using available cookies
export const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { createAuth } = await import("../../convex/auth");
  const { session } = await fetchSession(getRequest());
  const sessionCookieName = getCookieName(createAuth);
  const token = getCookie(sessionCookieName);
  console.log({ session });
  return {
    userId: session?.user.id,
    token,
  };
});
