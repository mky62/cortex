import { internalQuery } from "../_generated/server.js";
import { v } from "convex/values";


export const getByThreadId = internalQuery({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db
          .query("conversations")
          .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
          .unique();

        return conversation;  
    }
})

export const getById = internalQuery({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        return conversation;
    }
})
