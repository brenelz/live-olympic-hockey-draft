import { createRouter } from "@tanstack/solid-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { client } from "./integrations/convex/provider";

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      convexClient: client,
    },
  });
  return router;
};
