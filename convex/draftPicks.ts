import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get available players for a draft (players not yet picked)
export const getAvailablePlayers = query({
  args: {
    draftId: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    // Get all draft teams for this draft
    const teams = await ctx.db
      .query("draftTeams")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    // Get all picks for this draft (through teams)
    const allPicks = await Promise.all(
      teams.map(async (team) => {
        const picks = await ctx.db
          .query("draftPicks")
          .withIndex("draftTeamId", (q) => q.eq("draftTeamId", team._id))
          .collect();
        return picks;
      })
    );

    const pickedPlayerIds = new Set(
      allPicks.flat().map((pick) => pick.draftablePlayerId)
    );

    // Get all draftable players
    const allPlayers = await ctx.db.query("draftablePlayers").collect();

    // Filter out already picked players
    const availablePlayers = allPlayers.filter(
      (player) => !pickedPlayerIds.has(player._id)
    );

    // Sort alphabetically by name
    availablePlayers.sort((a, b) => a.name.localeCompare(b.name));

    return availablePlayers;
  },
});

// Get draft statistics
export const getDraftStats = query({
  args: {
    draftId: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    // Get draft info
    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      return null;
    }

    // Get all teams
    const teams = await ctx.db
      .query("draftTeams")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    const numTeams = teams.length;
    const maxPicks = numTeams * 6; // Assuming 6 rounds

    // Get all picks for this draft
    const allPicks = await Promise.all(
      teams.map(async (team) => {
        const picks = await ctx.db
          .query("draftPicks")
          .withIndex("draftTeamId", (q) => q.eq("draftTeamId", team._id))
          .collect();
        return picks;
      })
    );

    const picks = allPicks.flat();

    // Get player details for position counting
    const picksWithPlayers = await Promise.all(
      picks.map(async (pick) => {
        const player = await ctx.db.get(pick.draftablePlayerId);
        return player?.position;
      })
    );

    // Count by position
    const forwards = picksWithPlayers.filter(
      (pos) => pos === "C" || pos === "LW" || pos === "RW"
    ).length;
    const defense = picksWithPlayers.filter((pos) => pos === "D").length;
    const goalies = picksWithPlayers.filter((pos) => pos === "G").length;

    return {
      totalPicks: picks.length,
      maxPicks,
      forwards,
      defense,
      goalies,
      currentPick: draft.currentDraftPickNumber,
    };
  },
});

// Get all teams with their rosters for post-draft view
export const getDraftRosters = query({
  args: {
    draftId: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    // Get all teams for this draft
    const teams = await ctx.db
      .query("draftTeams")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    teams.sort((a, b) => a.draftOrderNumber - b.draftOrderNumber);

    // Get rosters for each team
    const teamsWithRosters = await Promise.all(
      teams.map(async (team) => {
        const picks = await ctx.db
          .query("draftPicks")
          .withIndex("draftTeamId", (q) => q.eq("draftTeamId", team._id))
          .collect();

        // Sort picks by pick number
        picks.sort((a, b) => a.draftPickNum - b.draftPickNum);

        // Get player details and organize by position
        const players = await Promise.all(
          picks.map(async (pick) => {
            const player = await ctx.db.get(pick.draftablePlayerId);
            if (!player) return null;
            return {
              name: player.name,
              position: player.position,
              avatar: player.avatar,
              pickNum: pick.draftPickNum,
            };
          })
        );

        const validPlayers = players.filter((p) => p !== null) as Array<{
          name: string;
          position: string;
          avatar: string;
          pickNum: number;
        }>;

        // Organize by position
        const forwards = validPlayers.filter(
          (p) =>
            p.position === "C" || p.position === "LW" || p.position === "RW"
        );
        const defense = validPlayers.filter((p) => p.position === "D");
        const goalies = validPlayers.filter((p) => p.position === "G");

        return {
          teamId: team._id,
          teamName: team.teamName,
          draftOrderNumber: team.draftOrderNumber,
          betterAuthUserId: team.betterAuthUserId,
          forwards,
          defense,
          goalies,
        };
      })
    );

    return teamsWithRosters;
  },
});

// Get recent picks for a draft
export const getRecentPicks = query({
  args: {
    draftId: v.id("drafts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // Get all draft teams for this draft
    const teams = await ctx.db
      .query("draftTeams")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    // Get all picks for this draft
    const allPicks = await Promise.all(
      teams.map(async (team) => {
        const picks = await ctx.db
          .query("draftPicks")
          .withIndex("draftTeamId", (q) => q.eq("draftTeamId", team._id))
          .collect();
        return picks.map((pick) => ({
          ...pick,
          teamId: team._id,
          teamName: team.teamName,
        }));
      })
    );

    // Flatten and sort by pick number (most recent first)
    const sortedPicks = allPicks
      .flat()
      .sort((a, b) => b.draftPickNum - a.draftPickNum)
      .slice(0, limit);

    // Get player details for each pick
    const picksWithPlayers = await Promise.all(
      sortedPicks.map(async (pick) => {
        const player = await ctx.db.get(pick.draftablePlayerId);
        return {
          pickNumber: pick.draftPickNum,
          teamName: pick.teamName,
          player: player
            ? {
                name: player.name,
                position: player.position,
                avatar: player.avatar,
              }
            : null,
        };
      })
    );

    return picksWithPlayers.filter((p) => p.player !== null);
  },
});

// Make a pick (save pick and advance turn)
export const makePick = mutation({
  args: {
    draftId: v.id("drafts"),
    playerId: v.id("draftablePlayers"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser._id) {
      throw new Error("User must be authenticated to make a pick");
    }

    const betterAuthUserId = authUser._id;

    // Get the draft
    const draft = await ctx.db.get(args.draftId);
    if (!draft || draft.status !== "DURING") {
      throw new Error("Draft is not in progress");
    }

    // Get current pick info to verify it's the user's turn
    const teams = await ctx.db
      .query("draftTeams")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    teams.sort((a, b) => a.draftOrderNumber - b.draftOrderNumber);

    const numTeams = teams.length;
    const pickNumber = draft.currentDraftPickNumber;

    // Calculate which team is on the clock (snake draft)
    const round = Math.ceil(pickNumber / numTeams);
    let teamIndex: number;

    if (round % 2 === 1) {
      teamIndex = (pickNumber - 1) % numTeams;
    } else {
      teamIndex = numTeams - 1 - ((pickNumber - 1) % numTeams);
    }

    const currentTeam = teams[teamIndex];

    // Verify it's the user's turn
    if (currentTeam.betterAuthUserId !== betterAuthUserId) {
      throw new Error("It's not your turn to pick");
    }

    // Check if player is already picked
    const existingPicks = await ctx.db
      .query("draftPicks")
      .withIndex("draftablePlayerId", (q) =>
        q.eq("draftablePlayerId", args.playerId)
      )
      .collect();

    // Check if this player was picked by any team in this draft
    const teamIds = new Set(teams.map((t) => t._id));
    const alreadyPicked = existingPicks.some((pick) =>
      teamIds.has(pick.draftTeamId)
    );

    if (alreadyPicked) {
      throw new Error("This player has already been picked");
    }

    // Check if a pick for this pick number already exists (race condition protection)
    // We need to check all picks for teams in this draft to see if pickNumber already exists
    const allDraftPicks = await ctx.db.query("draftPicks").collect();

    // Filter to picks for teams in this draft
    const teamIdsSet = new Set(teams.map((t) => t._id));
    const picksForThisDraft = allDraftPicks.filter((pick) =>
      teamIdsSet.has(pick.draftTeamId)
    );

    const pickForThisNumberExists = picksForThisDraft.some(
      (pick) => pick.draftPickNum === pickNumber
    );

    if (pickForThisNumberExists) {
      // A pick for this number already exists - another mutation already made the pick
      // Re-read draft to see current state
      const updatedDraft = await ctx.db.get(args.draftId);
      if (updatedDraft && updatedDraft.currentDraftPickNumber !== pickNumber) {
        // Turn already advanced, which is fine
        return { success: true, alreadyAdvanced: true };
      }
      throw new Error("A pick for this turn has already been made");
    }

    // Re-read draft one more time before inserting to ensure we have latest state
    const draftBeforeInsert = await ctx.db.get(args.draftId);
    if (!draftBeforeInsert || draftBeforeInsert.status !== "DURING") {
      throw new Error("Draft is not in progress");
    }

    // Double-check the pick number hasn't changed
    if (draftBeforeInsert.currentDraftPickNumber !== pickNumber) {
      // Turn already advanced by another mutation
      return { success: true, alreadyAdvanced: true };
    }

    // Save the pick
    await ctx.db.insert("draftPicks", {
      draftablePlayerId: args.playerId,
      draftTeamId: currentTeam._id,
      draftPickNum: pickNumber,
    });

    // Re-read draft one final time to ensure we have the latest state before advancing
    const updatedDraft = await ctx.db.get(args.draftId);
    if (!updatedDraft || updatedDraft.status !== "DURING") {
      throw new Error("Draft state changed during pick");
    }

    // Verify the pick number hasn't changed (another pick was made)
    if (updatedDraft.currentDraftPickNumber !== pickNumber) {
      // Another pick was made, which is fine - the turn already advanced
      return { success: true, alreadyAdvanced: true };
    }

    // Advance to next pick
    const maxPicks = numTeams * 10; // Assuming 10 rounds
    const nextPickNumber = pickNumber + 1;
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

