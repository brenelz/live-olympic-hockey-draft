import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router'

export const Route = createFileRoute('/_authed')({
    component: () => <><Outlet /></>,
    beforeLoad: async (ctx) => {
        if (!ctx.context.session) {
            throw redirect({ to: "/" });
        }
    },
})
