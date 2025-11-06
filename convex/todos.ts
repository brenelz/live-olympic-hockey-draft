import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get all todos for the current user
export const list = query({
    args: {},
    handler: async (ctx) => {
        const authUser = await authComponent.getAuthUser(ctx);
        if (!authUser || !authUser._id) {
            return [];
        }

        const betterAuthUserId = authUser._id;

        // Get all todos for this user
        const todos = await ctx.db
            .query("todos")
            .withIndex("betterAuthUserId", (q) => q.eq("betterAuthUserId", betterAuthUserId))
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

        // Create the todo
        const todoId = await ctx.db.insert("todos", {
            betterAuthUserId: betterAuthUserId,
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

        const betterAuthUserId = authUser._id;

        const todo = await ctx.db.get(args.id);
        if (!todo) {
            throw new Error("Todo not found");
        }

        // Verify the todo belongs to the current user
        if (!todo.betterAuthUserId || todo.betterAuthUserId !== betterAuthUserId) {
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

        const betterAuthUserId = authUser._id;

        const todo = await ctx.db.get(args.id);
        if (!todo) {
            throw new Error("Todo not found");
        }

        // Verify the todo belongs to the current user
        if (!todo.betterAuthUserId || todo.betterAuthUserId !== betterAuthUserId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
