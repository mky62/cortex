"use client"

import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react"
import { Id } from "@workspace/backend/convex/_generated/dataModel"
import { useAction, useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { MoreHorizontalIcon , MessageCircleIcon, Wand2Icon } from "lucide-react"
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,

} from "@workspace/ui/components/ai/conversation"
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputButton,
  AIInputTools
} from "@workspace/ui/components/ai/input"

import {
  AIMessage,
  AIMessageContent,

} from "@workspace/ui/components/ai/message"

import { AIResponse } from "@workspace/ui/components/ai/response"

 import { Form , FormField } from "@workspace/ui/components/form"
import { zodResolver } from "@hookform/resolvers/zod"
 import { useForm } from "react-hook-form"
 import * as z from "zod"

 const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
 })

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">
}) => {
  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  })

  

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation.threadId } : "skip",
    { initialNumItems : 10}
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  const createMessage = useAction(api.private.messages.create)

  const onsubmit = async (data: z.infer<typeof formSchema>) => {
   try {
    await createMessage({
      conversationId,
      prompt: data.message,
    })
   } catch (error) {
    console.error(error)
   }
  }
  
  const contactName = conversation?.contactSession?.name ?? "Conversation"

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-muted">
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
        <p className="min-w-0 truncate text-sm font-medium">{contactName}</p>
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </div>
      <AIConversation className="flex-1 overflow-hidden">
          <AIConversationContent>
            { toUIMessages(messages.results ?? [])?.map((message) => (
              <AIMessage
                 from={message.role === "user" ? "user" : "assistant"}
                 key={message.id}
              >
                <AIMessageContent>
                  <AIResponse>
                    {message.text}
                  </AIResponse>
                </AIMessageContent>
                {message.role === "user" && (
                  <div className="flex items-center gap-2">
                    <MessageCircleIcon className="size-4" />
                  </div>
                )}
              </AIMessage>
            )) }
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>

        <div
        className="p-2">
          <Form {...form}>
            <AIInput onSubmit={form.handleSubmit(onsubmit)}> 
            <FormField
            control={form.control}
            disabled={conversation?.status === "resolved"}
            name="message"
            render={({ field }) => (
              <AIInputTextarea
                disabled={
                  conversation?.status === "resolved" || form.formState.isSubmitting
                }
                onChange={field.onChange}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onsubmit)();
                  }
                }}
                placeholder={
                  conversation?.status === "resolved" ? "Conversation is resolved" : "Type your message..."
                }
                value={field.value}
              />
            )} />
            <AIInputToolbar />
            <AIInputTools>
              <AIInputButton>
                <Wand2Icon className="size-4" />
              </AIInputButton>
            </AIInputTools>
            <AIInputSubmit 
            disabled={conversation?.status === "resolved" || form.formState.isSubmitting}
            />
            </AIInput>
          </Form>
        </div>
    </div>
  )
}
