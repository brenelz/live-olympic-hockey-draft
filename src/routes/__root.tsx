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
import styleCss from "../styles.css?url";

import { fetchAuth } from "~/lib/auth.ts";

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [{ rel: "stylesheet", href: styleCss }],
  }),
  beforeLoad: async () => {
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
