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

        // Find or create the user in the users table
        let user = await ctx.db
            .query("users")
            .withIndex("betterAuthUserId", (q) => q.eq("betterAuthUserId", betterAuthUserId))
            .first();

        if (!user) {
            // Create user if they don't exist
            const userId = await ctx.db.insert("users", {
                name: authUser.name || "Unknown",
                email: authUser.email,
                betterAuthUserId: betterAuthUserId,
            });
            user = await ctx.db.get(userId);
        }

        if (!user) {
            throw new Error("Failed to create or find user");
        }

        // Create the draft
        const draftId = await ctx.db.insert("drafts", {
            name: args.name,
            startDatetime: args.startDatetime,
            hostUserId: user._id,
            status: "PRE",
        });

        // Create a draft team for the host
        await ctx.db.insert("draftTeams", {
            userId: user._id,
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
        draftId: v.id("drafts"),
    },
    handler: async (ctx, args) => {
        const draft = await ctx.db.get(args.draftId);
        if (!draft) {
            return null;
        }

        // Get team count for this draft
        const teams = await ctx.db
            .query("draftTeams")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .collect();

        return {
            ...draft,
            teamCount: teams.length,
        };
    },
});

export const isUserInDraft = query({
    args: {
        draftId: v.id("drafts"),
    },
    handler: async (ctx, args) => {
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            return false;
        }

        const betterAuthUserId = authUser._id;

        // Find the user in the users table
        const user = await ctx.db
            .query("users")
            .withIndex("betterAuthUserId", (q) => q.eq("betterAuthUserId", betterAuthUserId))
            .first();

        if (!user) {
            return false;
        }

        // Check if user already has a team in this draft
        const existingTeam = await ctx.db
            .query("draftTeams")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .filter((q) => q.eq(q.field("userId"), user._id))
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

        // Find or create the user in the users table
        let user = await ctx.db
            .query("users")
            .withIndex("betterAuthUserId", (q) => q.eq("betterAuthUserId", betterAuthUserId))
            .first();

        if (!user) {
            // Create user if they don't exist
            const userId = await ctx.db.insert("users", {
                name: authUser.name || "Unknown",
                email: authUser.email,
                betterAuthUserId: betterAuthUserId,
            });
            user = await ctx.db.get(userId);
        }

        if (!user) {
            throw new Error("Failed to create or find user");
        }

        // Check if draft exists
        const draft = await ctx.db.get(args.draftId);
        if (!draft) {
            throw new Error("Draft not found");
        }

        // Check if user is already in the draft
        const existingTeam = await ctx.db
            .query("draftTeams")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .filter((q) => q.eq(q.field("userId"), user._id))
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
            userId: user._id,
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

        // Find the user in the users table
        const user = await ctx.db
            .query("users")
            .withIndex("betterAuthUserId", (q) => q.eq("betterAuthUserId", betterAuthUserId))
            .first();

        if (!user) {
            return [];
        }

        // Get drafts where the user is the host
        const hostedDrafts = await ctx.db
            .query("drafts")
            .withIndex("hostUserId", (q) => q.eq("hostUserId", user._id))
            .collect();

        // Get drafts where the user is a participant
        const draftTeams = await ctx.db
            .query("draftTeams")
            .withIndex("userId", (q) => q.eq("userId", user._id))
            .collect();

        const participatingDrafts = await Promise.all(
            draftTeams.map((team) => ctx.db.get(team.draftId))
        );

        // Combine and deduplicate
        const allDrafts = [...hostedDrafts, ...participatingDrafts.filter(Boolean)];
        const uniqueDrafts = Array.from(
            new Map(allDrafts.map((draft) => [draft!._id, draft])).values()
        );

        return uniqueDrafts;
    },
});

