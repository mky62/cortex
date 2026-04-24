import { ConvexError, v } from "convex/values"
import { paginationOptsValidator } from "convex/server"
import type { MessageDoc } from "@convex-dev/agent"
import { mutation, query } from "../_generated/server.js"
import { supportAgent } from "../system/ai/agents/supportAgent.js"

export const updateStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      })
    }

    const orgId = identity.orgId as string | undefined

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Missing organization",
      })
    }

    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation || conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    await ctx.db.patch(args.conversationId, {
      status: args.status,
    })

    return conversation
  },
})
export const getOne = query({
  args: {
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

    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation || conversation.organizationId !== organizationId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    const contactSession = await ctx.db.get(conversation.contactSessionId)

    if (!contactSession) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Invalid Session"
      })
    }


    return {
      ...conversation,
      contactSession,
    }
  },
})

export const getMany = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("unresolved"),
        v.literal("escalated"),
        v.literal("resolved")
      )
    ),
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

    const conversations = args.status
      ? await ctx.db
          .query("conversations")
          .withIndex("by_status_and_organization_id", (q) =>
            q.eq("status", args.status!).eq("organizationId", organizationId)
          )
          .order("desc")
          .paginate(args.paginationOpts)
      : await ctx.db
          .query("conversations")
          .withIndex("by_organization_id", (q) =>
            q.eq("organizationId", organizationId)
          )
          .order("desc")
          .paginate(args.paginationOpts)

    const conversationsWithDetails = await Promise.all(
      conversations.page.map(async (conversation) => {
        const contactSession = await ctx.db.get(conversation.contactSessionId)
        let lastMessage: MessageDoc | null = null

        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          paginationOpts: { numItems: 1, cursor: null },
        })

        if (messages.page.length > 0) {
          lastMessage = messages.page[0] ?? null
        }

        return {
          ...conversation,
          contactSession,
          lastMessage,
        }
      })
    )

    return {
      ...conversations,
      page: conversationsWithDetails,
    }
  },
})
