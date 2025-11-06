import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    drafts: defineTable({
        name: v.string(),
        startDatetime: v.number(), // Unix timestamp in milliseconds
        hostUserId: v.id("users"),
        status: v.union(
            v.literal("PRE"),
            v.literal("DURING"),
            v.literal("POST")
        ),
    }).index("hostUserId", ["hostUserId"]),

    draftTeams: defineTable({
        userId: v.id("users"),
        draftId: v.id("drafts"),
        teamName: v.string(),
        draftOrderNumber: v.number(),
    })
        .index("draftId", ["draftId"])
        .index("userId", ["userId"]),

    draftablePlayers: defineTable({
        name: v.string(),
        avatar: v.string(), // URL or path to avatar image
        position: v.string(),
    }),

    draftPicks: defineTable({
        draftablePlayerId: v.id("draftablePlayers"),
        draftTeamId: v.id("draftTeams"),
        draftPickNum: v.number(),
    })
        .index("draftTeamId", ["draftTeamId"])
        .index("draftablePlayerId", ["draftablePlayerId"]),

    users: defineTable({
        name: v.string(),
        email: v.optional(v.string()),
        avatar: v.optional(v.string()), // URL to avatar image
        lastLoggedIn: v.optional(v.number()), // Unix timestamp in milliseconds
        active: v.optional(v.boolean()), // Whether the user account is active
        betterAuthUserId: v.optional(v.string()), // Link to Better Auth user ID
    })
        .index("email", ["email"])
        .index("betterAuthUserId", ["betterAuthUserId"]),
});
