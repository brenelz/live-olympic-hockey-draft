import {
  fetchSession,
  getCookieName,
} from "@convex-dev/better-auth/react-start";
import { createServerFn } from "@tanstack/solid-start";
import { getCookie, getRequest } from "@tanstack/solid-start/server";
import { fetchQuery } from "./auth-server";
import { api } from "convex/_generated/api";

// Get auth information for SSR using available cookies
export const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { createAuth } = await import("../../convex/auth");
  const { session } = await fetchSession(getRequest());
  const sessionCookieName = getCookieName(createAuth);
  const token = getCookie(sessionCookieName);

  return {
    session,
    token,
  };
});

export const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  const user = fetchQuery(api.auth.getCurrentUser, {});
  return user;
});

export const fetchUserDrafts = createServerFn({ method: "GET" }).handler(
  async () => {
    const drafts = fetchQuery(api.drafts.getUserDrafts, {});
    return drafts;
  }
);
