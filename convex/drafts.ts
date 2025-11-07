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
    if (draft.startDatetime > currentTime) {
      throw new Error("Cannot start draft before the scheduled start time");
    }

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

    // Check if draft is in DURING status
    if (draft.status !== "DURING") {
      throw new Error("Draft is not in during status");
    }

    // Update draft status to POST
    await ctx.db.patch(args.draftId, {
      status: "POST",
    });

    return { success: true };
  },
});

// Get current pick information (which team is on the clock)
export const getCurrentPick = query({
  args: {
    draftId: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft || draft.status !== "DURING") {
      return null;
    }

    // Get all teams sorted by draft order
    const teams = await ctx.db
      .query("draftTeams")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    teams.sort((a, b) => a.draftOrderNumber - b.draftOrderNumber);

    if (teams.length === 0) {
      return null;
    }

    const numTeams = teams.length;
    const pickNumber = draft.currentDraftPickNumber;

    // Calculate which team is on the clock (snake draft)
    // Round 1: picks 1-N go in order (team 1, 2, 3, ...)
    // Round 2: picks N+1-2N go in reverse (team N, N-1, N-2, ...)
    // Round 3: picks 2N+1-3N go in order again, etc.
    const round = Math.ceil(pickNumber / numTeams);
    let teamIndex: number;

    if (round % 2 === 1) {
      // Odd rounds: forward order
      teamIndex = (pickNumber - 1) % numTeams;
    } else {
      // Even rounds: reverse order
      teamIndex = numTeams - 1 - ((pickNumber - 1) % numTeams);
    }

    const currentTeam = teams[teamIndex];
    const currentPickStartTime = draft.currentPickStartTime || Date.now();

    return {
      pickNumber,
      round,
      team: currentTeam,
      startTime: currentPickStartTime,
    };
  },
});

// Advance to the next pick (called automatically after 45 seconds or manually)
export const advancePick = mutation({
  args: {
    draftId: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft || draft.status !== "DURING") {
      throw new Error("Draft is not in progress");
    }

    // Get teams to determine total
    const teams = await ctx.db
      .query("draftTeams")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    const numTeams = teams.length;
    const maxPicks = numTeams * 10; // Assuming 10 rounds for now

    const nextPickNumber = draft.currentDraftPickNumber + 1;
    const now = Date.now();

    if (nextPickNumber > maxPicks) {
      // Draft is complete
      await ctx.db.patch(args.draftId, {
        status: "POST",
      });
    } else {
      // Advance to next pick
      await ctx.db.patch(args.draftId, {
        currentDraftPickNumber: nextPickNumber,
        currentPickStartTime: now,
      });
    }

    return { success: true };
  },
});

// Re-export functions from other modules
export {
  joinDraft,
  getDraftTeams,
  isUserInDraft,
  randomizeDraftTeams,
} from "./draftTeams";
export {
  getAvailablePlayers,
  getDraftStats,
  getDraftRosters,
  getRecentPicks,
  makePick,
} from "./draftPicks";
export {
  updatePresence,
  getOnlineUsers,
  removePresence,
} from "./draftPresence";
