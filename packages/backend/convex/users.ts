import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMany = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();

        return users;

    },
});

export const add = mutation({
    args: {},

    handler: async (ctx) => {

        const identity = await ctx.auth.getUserIdentity();

        if (identity == null) {
            throw new Error("unauthorized");

        }
        const users = await ctx.db.insert("users", {
            name: "John Doe",
            tokenIdentifier: "1234567890",
        });

        return users;

    },
});