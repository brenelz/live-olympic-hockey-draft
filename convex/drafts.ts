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
            currentDraftPickNumber: 1,
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
        if (!draft.hostBetterAuthUserId || draft.hostBetterAuthUserId !== betterAuthUserId) {
            throw new Error("Only the host can randomize the draft");
        }

        // Check if draft is in PRE status
        if (draft.status !== "PRE") {
            throw new Error("Draft is not in pre-draft status");
        }

        // Fetch all draft teams for this draft
        const draftTeams = await ctx.db.query("draftTeams")
            .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
            .collect();

        if (!draftTeams.length) {
            throw new Error("No teams found for this draft");
        }

        // Shuffle teams using Fisher-Yates
        const shuffledTeams = [...draftTeams];
        for (let i = shuffledTeams.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
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
        if (!draft.hostBetterAuthUserId || draft.hostBetterAuthUserId !== betterAuthUserId) {
            throw new Error("Only the host can finish the draft");
        }

        // Check if draft is in PRE status
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
            teamIndex = ((pickNumber - 1) % numTeams);
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

        // Sort by position, then name
        availablePlayers.sort((a, b) => {
            if (a.position !== b.position) {
                const positionOrder = { C: 1, LW: 2, RW: 3, D: 4, G: 5 };
                return (positionOrder[a.position as keyof typeof positionOrder] || 99) -
                    (positionOrder[b.position as keyof typeof positionOrder] || 99);
            }
            return a.name.localeCompare(b.name);
        });

        return availablePlayers;
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
            teamIndex = ((pickNumber - 1) % numTeams);
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
            .withIndex("draftablePlayerId", (q) => q.eq("draftablePlayerId", args.playerId))
            .collect();

        // Check if this player was picked by any team in this draft
        const teamIds = new Set(teams.map((t) => t._id));
        const alreadyPicked = existingPicks.some((pick) => teamIds.has(pick.draftTeamId));

        if (alreadyPicked) {
            throw new Error("This player has already been picked");
        }

        // Save the pick
        await ctx.db.insert("draftPicks", {
            draftablePlayerId: args.playerId,
            draftTeamId: currentTeam._id,
            draftPickNum: pickNumber,
        });

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

