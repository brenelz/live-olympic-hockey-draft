import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get all todos for the current user
export const list = query({
    args: {},
    handler: async (ctx) => {
        // console.log('test');
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

        // Get all todos for this user
        const todos = await ctx.db
            .query("todos")
            .withIndex("userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        return todos;
    },
});

// Create a new todo
export const create = mutation({
    args: {
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            throw new Error("User must be authenticated to create a todo");
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

        // Create the todo
        const todoId = await ctx.db.insert("todos", {
            userId: user._id,
            text: args.text,
            isCompleted: false,
        });

        return todoId;
    },
});

// Toggle a todo's completed status
export const toggle = mutation({
    args: {
        id: v.id("todos"),
    },
    handler: async (ctx, args) => {
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            throw new Error("User must be authenticated");
        }

        const todo = await ctx.db.get(args.id);
        if (!todo) {
            throw new Error("Todo not found");
        }

        // Verify the todo belongs to the current user
        const betterAuthUserId = authUser._id;
        const user = await ctx.db
            .query("users")
            .withIndex("betterAuthUserId", (q) => q.eq("betterAuthUserId", betterAuthUserId))
            .first();

        if (!user || todo.userId !== user._id) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            isCompleted: !todo.isCompleted,
        });
    },
});

// Delete a todo
export const remove = mutation({
    args: {
        id: v.id("todos"),
    },
    handler: async (ctx, args) => {
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            throw new Error("User must be authenticated");
        }

        const todo = await ctx.db.get(args.id);
        if (!todo) {
            throw new Error("Todo not found");
        }

        // Verify the todo belongs to the current user
        const betterAuthUserId = authUser._id;
        const user = await ctx.db
            .query("users")
            .withIndex("betterAuthUserId", (q) => q.eq("betterAuthUserId", betterAuthUserId))
            .first();

        if (!user || todo.userId !== user._id) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

