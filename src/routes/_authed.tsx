import { createFileRoute, Outlet, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/_authed")({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  beforeLoad: async (ctx) => {
    if (!ctx.context.token || !ctx.context.session) {
      // Preserve the current path as a redirect parameter
      const currentPath = ctx.location.pathname + ctx.location.searchStr;
      throw redirect({
        to: "/",
        search: { redirect: currentPath }
      });
    }
  },
});
