import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const create = mutation({
    args: {
        name: v.string(),
        startDatetime: v.number(), // Unix timestamp in milliseconds
    },
    handler: async (ctx, args) => {
        // Get the current authenticated user
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            throw new Error("User must be authenticated to create a draft");
        }

        const betterAuthUserId = authUser._id;

        // Create the draft
        const draftId = await ctx.db.insert("drafts", {
            name: args.name,
            startDatetime: args.startDatetime,
            hostBetterAuthUserId: betterAuthUserId,
            status: "PRE",
        });

        // Create a draft team for the host
        await ctx.db.insert("draftTeams", {
            betterAuthUserId: betterAuthUserId,
            draftId,
            teamName: `${authUser.name || "Host"}'s Team`,
            draftOrderNumber: 1, // Host gets first pick by default
        });

        return draftId;
    },
});

export const getDraftById = query({
    args: {
        draftId: v.id("drafts"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.draftId);
    },
});

export const getDraftWithTeamCount = query({
    args: {
        draftId: v.optional(v.id("drafts")),
    },
    handler: async (ctx, args) => {
        if (!args.draftId) {
            return null;
        }

        const draftId = args.draftId;
        const draft = await ctx.db.get(draftId);
        if (!draft) {
            return null;
        }

        // Get team count for this draft
        const teams = await ctx.db
            .query("draftTeams")
            .withIndex("draftId", (q) => q.eq("draftId", draftId))
            .collect();

        return {
            ...draft,
            teamCount: teams.length,
        };
    },
});

export const isUserInDraft = query({
    args: {
        draftId: v.optional(v.id("drafts")),
    },
    handler: async (ctx, args) => {
        if (!args.draftId) {
            return false;
        }

        const draftId = args.draftId;
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            return false;
        }

        const betterAuthUserId = authUser._id;

        // Check if user already has a team in this draft
        const existingTeam = await ctx.db
            .query("draftTeams")
            .withIndex("draftId", (q) => q.eq("draftId", draftId))
            .filter((q) => q.eq(q.field("betterAuthUserId"), betterAuthUserId))
            .first();

        return !!existingTeam;
    },
});

export const joinDraft = mutation({
    args: {
        draftId: v.id("drafts"),
        teamName: v.string(),
    },
    handler: async (ctx, args) => {
        // Get the current authenticated user
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            throw new Error("User must be authenticated to join a draft");
        }

        const betterAuthUserId = authUser._id;

        // Check if draft exists
        const draft = await ctx.db.get(args.draftId);
        if (!draft) {
            throw new Error("Draft not found");
        }

        // Check if user is already in the draft
        const existingTeam = await ctx.db
            .query("draftTeams")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .filter((q) => q.eq(q.field("betterAuthUserId"), betterAuthUserId))
            .first();

        if (existingTeam) {
            throw new Error("You are already in this draft");
        }

        // Get current team count to assign draft order
        const existingTeams = await ctx.db
            .query("draftTeams")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .collect();

        const draftOrderNumber = existingTeams.length + 1;

        // Create draft team for the user
        const teamId = await ctx.db.insert("draftTeams", {
            betterAuthUserId: betterAuthUserId,
            draftId: args.draftId,
            teamName: args.teamName,
            draftOrderNumber,
        });

        return teamId;
    },
});

export const getUserDrafts = query({
    args: {},
    handler: async (ctx) => {
        // Get the current authenticated user
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            return [];
        }

        const betterAuthUserId = authUser._id;

        // Get drafts where the user is the host
        const hostedDrafts = await ctx.db
            .query("drafts")
            .withIndex("hostBetterAuthUserId", (q) => q.eq("hostBetterAuthUserId", betterAuthUserId))
            .collect();

        // Get drafts where the user is a participant
        const draftTeams = await ctx.db
            .query("draftTeams")
            .withIndex("betterAuthUserId", (q) => q.eq("betterAuthUserId", betterAuthUserId))
            .collect();

        const participatingDrafts = await Promise.all(
            draftTeams.map((team) => ctx.db.get(team.draftId))
        );

        // Combine and deduplicate
        const allDrafts = [...hostedDrafts, ...participatingDrafts.filter(Boolean)];
        const uniqueDrafts = Array.from(
            new Map(allDrafts.map((draft) => [draft!._id, draft])).values()
        );

        // Add team counts and user's team info to each draft
        const draftsWithDetails = await Promise.all(
            uniqueDrafts.map(async (draft) => {
                if (!draft) return null;

                const teams = await ctx.db
                    .query("draftTeams")
                    .withIndex("draftId", (q) => q.eq("draftId", draft._id))
                    .collect();

                const userTeam = teams.find((team) => team.betterAuthUserId === betterAuthUserId);

                return {
                    ...draft,
                    teamCount: teams.length,
                    userTeamName: userTeam?.teamName,
                };
            })
        );

        return draftsWithDetails.filter(Boolean);
    },
});

export const getDraftTeams = query({
    args: {
        draftId: v.id("drafts"),
    },
    handler: async (ctx, args) => {
        const teams = await ctx.db
            .query("draftTeams")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .collect();

        // Sort by draft order
        teams.sort((a, b) => a.draftOrderNumber - b.draftOrderNumber);

        return teams;
    },
});

export const startDraft = mutation({
    args: {
        draftId: v.id("drafts"),
    },
    handler: async (ctx, args) => {
        // Get the current authenticated user
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            throw new Error("User must be authenticated to start a draft");
        }

        const betterAuthUserId = authUser._id;

        // Get the draft
        const draft = await ctx.db.get(args.draftId);
        if (!draft) {
            throw new Error("Draft not found");
        }

        // Check if user is the host
        if (!draft.hostBetterAuthUserId || draft.hostBetterAuthUserId !== betterAuthUserId) {
            throw new Error("Only the host can start the draft");
        }

        // Check if draft is in PRE status
        if (draft.status !== "PRE") {
            throw new Error("Draft is not in pre-draft status");
        }

        // Check if countdown is over (start time has passed)
        const now = Date.now();
        if (draft.startDatetime > now) {
            throw new Error("Cannot start draft before the scheduled start time");
        }

        // Update draft status to DURING
        await ctx.db.patch(args.draftId, {
            status: "DURING",
        });

        return { success: true };
    },
});

// Update heartbeat to track user presence in a draft
export const updatePresence = mutation({
    args: {
        draftId: v.id("drafts"),
    },
    handler: async (ctx, args) => {
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            return;
        }

        const betterAuthUserId = authUser._id;
        const now = Date.now();

        // Find existing presence entry
        const existing = await ctx.db
            .query("draftPresence")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .filter((q) => q.eq(q.field("betterAuthUserId"), betterAuthUserId))
            .first();

        if (existing) {
            // Update last seen timestamp
            await ctx.db.patch(existing._id, {
                lastSeen: now,
            });
        } else {
            // Create new presence entry
            await ctx.db.insert("draftPresence", {
                draftId: args.draftId,
                betterAuthUserId,
                lastSeen: now,
            });
        }
    },
});

// Get online users for a draft (users who have been active in the last 30 seconds)
export const getOnlineUsers = query({
    args: {
        draftId: v.id("drafts"),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const ONLINE_THRESHOLD = 30 * 1000; // 30 seconds

        // Get all presence entries for this draft
        const presenceEntries = await ctx.db
            .query("draftPresence")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .collect();

        // Filter to only users who have been active recently
        // Users are considered offline if their lastSeen is older than 30 seconds
        const onlineUserIds = presenceEntries
            .filter((entry) => now - entry.lastSeen < ONLINE_THRESHOLD)
            .map((entry) => entry.betterAuthUserId);

        return onlineUserIds;
    },
});

// Remove presence when user leaves the draft page
export const removePresence = mutation({
    args: {
        draftId: v.id("drafts"),
    },
    handler: async (ctx, args) => {
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            return;
        }

        const betterAuthUserId = authUser._id;

        // Find and delete presence entry
        const existing = await ctx.db
            .query("draftPresence")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .filter((q) => q.eq(q.field("betterAuthUserId"), betterAuthUserId))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

