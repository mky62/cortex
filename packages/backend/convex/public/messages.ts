import { ConvexError, v } from "convex/values"
import { action, query } from "../_generated/server.js"
import { components, internal } from "../_generated/api.js"
import {
  generateSupportText,
  supportAgent,
} from "../system/ai/agents/supportAgent.js"
import { paginationOptsValidator } from "convex/server"
import { resolveConversation } from "../system/ai/tools/resolveConversations.js"
import { escalateConversation } from "../system/ai/tools/escalateConversation.js"
import { saveMessage } from "@convex-dev/agent"

export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.runQuery(
      internal.system.contactSessions.getOne,
      {
        contactSessionId: args.contactSessionId,
      }
    )

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "invalid",
      })
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      {
        threadId: args.threadId,
      }
    )

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "conversation not found",
      })
    }

    if (conversation.contactSessionId !== args.contactSessionId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      })
    }

    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "conversation resolved",
      })
    }

    await generateSupportText(
      ctx,
      { threadId: args.threadId },
      {
        prompt: args.prompt,
      }
    )

    const shouldTriggerAgent = conversation.status === "unresolved"

    if (shouldTriggerAgent) {
      await supportAgent.generateText(
        ctx,
        { threadId: args.threadId },
        {
          prompt: args.prompt,
          tools: {
            escalateConversationTool: escalateConversation,
            resolveConversationTool: resolveConversation,
          },
        }
      )
    } else {
      await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        prompt: args.prompt,
      })
    }
  },
})

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId)

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Session",
      })
    }

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first()

    if (
      !conversation ||
      conversation.contactSessionId !== args.contactSessionId
    ) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      })
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    })

    return paginated
  },
})
