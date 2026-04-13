import { mutation , query} from "../_generated/server"
import { ConvexError, v } from "convex/values"
import { supportAgent }  from '../system/ai/agents/supportAgent'
import { paginationOptsValidator } from "convex/server"

export const getMany = query({
    args: {
        contactSessionId: v.id("contactSessions"),
        paginationOpts: paginationOptsValidator
    },


    handler: async (ctx, args) => {
        const contactSession = await ctx.db.get(args.contactSessionId);

        if (!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session",
            });
        }

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_contact_session_id", (q) => 
                q.eq("contactSessionId", args.contactSessionId)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    },
})
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


        const { threadId } = await supportAgent.createThread(ctx, {
            userId: args.organizationId,
        })
        const conversationId = await ctx.db.insert("conversations", {
            organizationId: args.organizationId,
            contactSessionId: args.contactSessionId,
            threadId,
            status: "unresolved"
        })

        return conversationId;
    }
})
