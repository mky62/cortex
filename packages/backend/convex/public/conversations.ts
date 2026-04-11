import { mutation , query} from "../_generated/server"
import { ConvexError, v } from "convex/values"

export const getOne = query({
    args: {
        conversationId: v.id("conversations"),
        contactSessionId: v.id("contactSessions")
    },
   handler: async (ctx, args ) => {
    const session = await ctx.db.get(args.contactSessionId)

    if ( !session || session.expiresAt < Date.now()) {
        throw new ConvexError({
            message: "Session expired or not found",
            code: "UNAUTHORIZED"
        })
    }

    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation || conversation.contactSessionId !== args.contactSessionId) {
        throw new ConvexError({
            message: "Conversation not found",
            code: "NOT_FOUND"
        })
    }

    return {
        _id: conversation._id,
        status: conversation.status,
        threadId: conversation.threadId
    };
   },
})

export const create = mutation({
    args :
    {
        organizationId: v.string(),
        contactSessionId: v.id("contactSessions")
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId)

         if ( !session || session.expiresAt < Date.now()){
            throw new ConvexError({
                message: "Session expired or not found",
                code: "UNAUTHORIZED"
            })
        }

        const threadId = crypto.randomUUID()

        const conversationId = await ctx.db.insert("conversations", {
            organizationId: args.organizationId,
            contactSessionId: args.contactSessionId,
            threadId,
            status: "unresolved"
        })

        return conversationId;
    }
})
