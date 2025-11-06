import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    drafts: defineTable({
        name: v.string(),
        startDatetime: v.number(), // Unix timestamp in milliseconds
        hostBetterAuthUserId: v.string(),
        status: v.union(
            v.literal("PRE"),
            v.literal("DURING"),
            v.literal("POST")
        ),
    }).index("hostBetterAuthUserId", ["hostBetterAuthUserId"]),

    draftTeams: defineTable({
        betterAuthUserId: v.string(),
        draftId: v.id("drafts"),
        teamName: v.string(),
        draftOrderNumber: v.number(),
    })
        .index("draftId", ["draftId"])
        .index("betterAuthUserId", ["betterAuthUserId"]),

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

    todos: defineTable({
        betterAuthUserId: v.string(),
        text: v.string(),
        isCompleted: v.boolean(),
    }).index("betterAuthUserId", ["betterAuthUserId"]),
});
