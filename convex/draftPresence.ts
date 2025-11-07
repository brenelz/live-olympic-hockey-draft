import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

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

