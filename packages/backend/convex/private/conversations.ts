import { ConvexError, v } from "convex/values"
import { paginationOptsValidator } from "convex/server"
import type { MessageDoc } from "@convex-dev/agent"

import { query } from "../_generated/server.js"
import { supportAgent } from "../system/ai/agents/supportAgent.js"

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
