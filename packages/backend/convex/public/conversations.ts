import { mutation , query} from "../_generated/server.js"
import { ConvexError, v } from "convex/values"
import { supportAgent }  from '../system/ai/agents/supportAgent.js'
import { paginationOptsValidator } from "convex/server"
import { MessageDoc, saveMessage } from "@convex-dev/agent"
import { components } from "../_generated/api.js"


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

        const conversationsWithLastMessage = await Promise.all(
        conversations.page.map(async (conversation) => {
            let lastMessage: MessageDoc | null = null;

            // For chat conversations (or legacy without type), get last message from thread
            if ((conversation.type === "chat" || !conversation.type) && conversation.threadId) {
                const messages = await supportAgent.listMessages(ctx, {
                    threadId: conversation.threadId,
                    paginationOpts: {numItems: 1, cursor: null }
                });

                if (messages.page.length > 0) {
                    lastMessage = messages.page[0] ?? null;
                }
            }

            return {
                _id: conversation._id,
                _creationTime: conversation._creationTime,
                status: conversation.status,
                organizationId: conversation.organizationId,
                threadId: conversation.threadId,
                type: conversation.type,
                voiceTranscript: conversation.voiceTranscript,
                voiceMetadata: conversation.voiceMetadata,
                lastMessage,
            }
        })
    );

    return {
        ...conversations,
        page: conversationsWithLastMessage,
    };
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
        threadId: conversation.threadId,
        type: conversation.type || "chat",
        voiceTranscript: conversation.voiceTranscript,
        voiceMetadata: conversation.voiceMetadata,
    };
   },
})

export const createVoice = mutation({
    args: {
        organizationId: v.string(),
        contactSessionId: v.id("contactSessions"),
        callId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId)

        if (!session || session.expiresAt < Date.now()) {
            throw new ConvexError({
                message: "Session expired or not found",
                code: "UNAUTHORIZED"
            })
        }

        const conversationId = await ctx.db.insert("conversations", {
            organizationId: args.organizationId,
            contactSessionId: args.contactSessionId,
            threadId: undefined,
            status: "unresolved",
            type: "voice",
            voiceTranscript: [],
            voiceMetadata: {
                callId: args.callId,
                startedAt: Date.now(),
            },
        })

        return conversationId;
    }
})

export const updateVoiceTranscript = mutation({
    args: {
        conversationId: v.id("conversations"),
        contactSessionId: v.id("contactSessions"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId)

        if (!session || session.expiresAt < Date.now()) {
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

        if (conversation.type !== "voice") {
            throw new ConvexError({
                message: "Not a voice conversation",
                code: "BAD_REQUEST"
            })
        }

        const currentTranscript = conversation.voiceTranscript || [];
        
        await ctx.db.patch(args.conversationId, {
            voiceTranscript: [...currentTranscript, {
                role: args.role,
                text: args.text,
                timestamp: Date.now(),
            }],
        })
    }
})

export const completeVoiceConversation = mutation({
    args: {
        conversationId: v.id("conversations"),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId)

        if (!session || session.expiresAt < Date.now()) {
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

        if (conversation.type !== "voice") {
            throw new ConvexError({
                message: "Not a voice conversation",
                code: "BAD_REQUEST"
            })
        }

        const startedAt = conversation.voiceMetadata?.startedAt || Date.now();
        const duration = Math.floor((Date.now() - startedAt) / 1000);

        await ctx.db.patch(args.conversationId, {
            voiceMetadata: {
                ...conversation.voiceMetadata,
                endedAt: Date.now(),
                duration,
            },
        })
    }
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

        const widgetSettings = await ctx.db
            .query("widgetSettings")
            .withIndex("by_organization_id", (q) => 
            q.eq("organizationId", args.organizationId),
        )
        .unique();


        const { threadId } = await supportAgent.createThread(ctx, {
            userId: args.organizationId,
        })


        await saveMessage(ctx,components.agent,
            { 
                threadId,
                message: {
                    role: "assistant",
                    content: widgetSettings?.greetMessage || "Hello, how can I help you today"
                }
        
      })

        const conversationId = await ctx.db.insert("conversations", {
            organizationId: args.organizationId,
            contactSessionId: args.contactSessionId,
            threadId,
            status: "unresolved",
            type: "chat",
        })

        return conversationId;
    }
})
