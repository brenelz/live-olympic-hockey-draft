import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Simplified presence: single mutation that handles upsert + cleanup
export const heartbeat = mutation({
  args: {
    draftId: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser?._id) return;

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
      await ctx.db.patch(existing._id, { lastSeen: now });
    } else {
      // Create new presence entry
      await ctx.db.insert("draftPresence", {
        draftId: args.draftId,
        betterAuthUserId,
        lastSeen: now,
      });
    }

    // Auto-cleanup stale entries (older than 60 seconds) - runs on every heartbeat
    const staleThreshold = now - 60 * 1000;
    const staleEntries = await ctx.db
      .query("draftPresence")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .filter((q) => q.lt(q.field("lastSeen"), staleThreshold))
      .collect();

    for (const entry of staleEntries) {
      await ctx.db.delete(entry._id);
    }
  },
});

// Get online users for a draft (simplified - just filter by threshold)
export const getOnlineUsers = query({
  args: {
    draftId: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ONLINE_THRESHOLD = 30 * 1000; // 30 seconds

    const presenceEntries = await ctx.db
      .query("draftPresence")
      .withIndex("draftId", (q) => q.eq("draftId", args.draftId))
      .collect();

    return presenceEntries
      .filter((entry) => now - entry.lastSeen < ONLINE_THRESHOLD)
      .map((entry) => entry.betterAuthUserId);
  },
});

