"use client"

import { Id } from "@workspace/backend/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { MoreHorizontalIcon } from "lucide-react"
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })
  
  const contactName = conversation?.contactSession?.name ?? "Conversation"

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-muted">
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
        <p className="min-w-0 truncate text-sm font-medium">{contactName}</p>
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden" />
    </div>
  )
}
