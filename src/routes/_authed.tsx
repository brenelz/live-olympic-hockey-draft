import { createFileRoute, Outlet, redirect } from "@tanstack/solid-router";
import { fetchUser } from "~/lib/server";

export const Route = createFileRoute("/_authed")({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  beforeLoad: async (ctx) => {
    const userPromise = fetchUser();
    if (!ctx.context.token || !ctx.context.session) {
      // Preserve the current path as a redirect parameter
      const currentPath = ctx.location.pathname + ctx.location.search;
      throw redirect({
        to: "/",
        search: { redirect: currentPath }
      });
    }
    return { userPromise };
  },
});
