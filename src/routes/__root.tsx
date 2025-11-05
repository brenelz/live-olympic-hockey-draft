import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import ConvexProvider from "../integrations/convex/provider.tsx";
import { HydrationScript } from "solid-js/web";
import { Suspense } from "solid-js";
import { getCookie, getRequest } from "@tanstack/solid-start/server";
import styleCss from "../styles.css?url";
import { createServerFn } from "@tanstack/solid-start";
import {
  fetchSession,
  getCookieName,
} from "@convex-dev/better-auth/react-start";

// Get auth information for SSR using available cookies
const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { createAuth } = await import("../../convex/auth");
  const { session } = await fetchSession(getRequest());
  const sessionCookieName = getCookieName(createAuth);
  const token = getCookie(sessionCookieName);
  return {
    userId: session?.user.id,
    token,
  };
});

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [{ rel: "stylesheet", href: styleCss }],
  }),
  beforeLoad: async () => {
    // all queries, mutations and action made with TanStack Query will be
    // authenticated by an identity token.
    const { userId, token } = await fetchAuth();

    return { userId, token };
  },
  shellComponent: RootComponent,
});

function RootComponent() {
  return (
    <html>
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <Suspense>
          <ConvexProvider>
            <Outlet />
            <TanStackRouterDevtools />
          </ConvexProvider>
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}
