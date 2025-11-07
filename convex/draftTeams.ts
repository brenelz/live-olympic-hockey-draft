import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Check if user is already in a draft
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

// Join a draft by creating a draft team
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

// Get all teams for a draft
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

// Randomize the draft order of teams
export const randomizeDraftTeams = mutation({
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
      throw new Error("Only the host can randomize the draft");
    }

    // Check if draft is in PRE status
    if (draft.status !== "PRE") {
      throw new Error("Draft is not in pre-draft status");
    }

    // Fetch all draft teams for this draft
    const draftTeams = await ctx.db
      .query("draftTeams")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    if (!draftTeams.length) {
      throw new Error("No teams found for this draft");
    }

    // Shuffle teams using Fisher-Yates
    const shuffledTeams = [...draftTeams];
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTeams[i], shuffledTeams[j]] = [
        shuffledTeams[j],
        shuffledTeams[i],
      ];
    }

    // Update draftOrderNumber for each team
    for (let i = 0; i < shuffledTeams.length; i++) {
      await ctx.db.patch(shuffledTeams[i]._id, {
        draftOrderNumber: i + 1,
      });
    }

    return { success: true };
  },
});

