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

import { fetchAuth } from "~/lib/server.ts";

export const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [{
      title: 'Live Olympic Hockey Draft',
      description: 'Tanstack Start Hackathon Project',
    }],
    links: [{ rel: "stylesheet", href: styleCss }],
  }),
  beforeLoad: async () => {
    const { session, token } = await fetchAuth();
    return { session, token };
  },
  shellComponent: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <Suspense>
          <ConvexProvider>
            <Outlet />
            {import.meta.env.DEV && <TanStackRouterDevtools />}
          </ConvexProvider>
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}
