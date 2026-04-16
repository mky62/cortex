import { query, mutation } from "./_generated/server.js";
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

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new Error ('missing organization')
        }


        const users = await ctx.db.insert("users", {
            name: "John Doe",
            tokenIdentifier: "1234567890",
        });

        return users;

    },
});
