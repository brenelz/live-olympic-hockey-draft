import { createFileRoute, Outlet, redirect } from "@tanstack/solid-router";
import { fetchUser } from "~/lib/server";

export const Route = createFileRoute("/_authed")({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  beforeLoad: async (ctx) => {
    const user = await fetchUser();
    if (!ctx.context.token || !ctx.context.session || !user) {
      throw redirect({ to: "/" });
    }
    return { user };
  },
});
