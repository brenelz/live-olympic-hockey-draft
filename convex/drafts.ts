import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Create a new draft
export const createDraft = mutation({
  args: {
    name: v.string(),
    startDatetime: v.number(), // Unix timestamp in milliseconds
    teamName: v.string(),
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
      currentDraftPickNumber: 1,
    });

    // Create a draft team for the host
    await ctx.db.insert("draftTeams", {
      betterAuthUserId: betterAuthUserId,
      draftId,
      teamName: args.teamName,
      draftOrderNumber: 1, // Host gets first pick by default
    });

    return draftId;
  },
});

// Get draft by ID
export const getDraftById = query({
  args: {
    draftId: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.draftId);
  },
});

// Get draft with team count
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

// Get all drafts for the current user (hosted or participated)
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
      .withIndex("hostBetterAuthUserId", (q) =>
        q.eq("hostBetterAuthUserId", betterAuthUserId)
      )
      .collect();

    // Get drafts where the user is a participant
    const draftTeams = await ctx.db
      .query("draftTeams")
      .withIndex("betterAuthUserId", (q) =>
        q.eq("betterAuthUserId", betterAuthUserId)
      )
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

        const userTeam = teams.find(
          (team) => team.betterAuthUserId === betterAuthUserId
        );

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

// Start a draft (change status from PRE to DURING)
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
    if (
      !draft.hostBetterAuthUserId ||
      draft.hostBetterAuthUserId !== betterAuthUserId
    ) {
      throw new Error("Only the host can start the draft");
    }

    // Check if draft is in PRE status
    if (draft.status !== "PRE") {
      throw new Error("Draft is not in pre-draft status");
    }

    // Check if countdown is over (start time has passed)
    const currentTime = Date.now();

    // Get teams to determine total number
    const teams = await ctx.db
      .query("draftTeams")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    if (teams.length === 0) {
      throw new Error("Cannot start draft with no teams");
    }

    // Update draft status to DURING and initialize pick timing
    await ctx.db.patch(args.draftId, {
      status: "DURING",
      currentDraftPickNumber: 1,
      currentPickStartTime: currentTime,
    });

    return { success: true };
  },
});

// Finish a draft (change status from DURING to POST)
export const finishDraft = mutation({
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
    if (
      !draft.hostBetterAuthUserId ||
      draft.hostBetterAuthUserId !== betterAuthUserId
    ) {
      throw new Error("Only the host can finish the draft");
    }

    // Update draft status to POST
    await ctx.db.patch(args.draftId, {
      status: "POST",
    });

    return { success: true };
  },
});
