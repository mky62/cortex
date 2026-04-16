import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server.js";
import { internal } from "../_generated/api.js";
import { supportAgent } from "../system/ai/agents/supportAgent.js";
import { paginationOptsValidator } from "convex/server";


export const create = action({
    args: {
        prompt: v.string(),
        conversationId: v.id("conversations"),
    },
     handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            })
        }

        const organizationId = identity.orgId as string | undefined

        if (!organizationId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Missing organization",
            })
        }

        const conversation = await ctx.runQuery(
            internal.system.conversations.getById,
            { conversationId: args.conversationId }
        );

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "conversation not found"
            })
        }

        if (conversation.organizationId !== organizationId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Unauthorized"
            })
        }

        if (conversation.status === "resolved") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "conversation resolved"
            });
        }

        await supportAgent.generateText(
            ctx,
            { threadId: conversation.threadId },
            { prompt: args.prompt }
        )
    }
});

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
     },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      })
    }

    const organizationId = identity.orgId as string | undefined

    if (!organizationId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Missing organization",
      })
    }

    const conversation = await ctx.db
        .query("conversations")
        .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
        .first();

    if (!conversation) {
        throw new ConvexError({
            code: "NOT_FOUND",
            message: "conversation not found"
        })
    }

    if (conversation?.organizationId !== organizationId) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "Unauthorized"
        })
    }

        const paginated = await supportAgent.listMessages(ctx, {
            threadId: args.threadId,
            paginationOpts: args.paginationOpts,
        })

        return paginated;
    }
})
