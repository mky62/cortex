"use client"

import { useState } from "react";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { ConversationStatusButton } from "../components/conversation-status-button";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react"
import { Id } from "@workspace/backend/convex/_generated/dataModel"
import { useMutation, useQuery, useAction } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { MoreHorizontalIcon , MessageCircleIcon, Wand2Icon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "sonner";
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

import { Skeleton } from "@workspace/ui/components/skeleton";

import { AIResponse } from "@workspace/ui/components/ai/response"

 import { Form , FormField } from "@workspace/ui/components/form"
import { zodResolver } from "@hookform/resolvers/zod"
 import { useForm } from "react-hook-form"
 import * as z from "zod"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";

 const formSchema = z.object({
  message: z.string().min(1, "Message is required")
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

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
  } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  const [isEnhancing, setIsEnhancing] = useState(false);
  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
  const messageValue = form.watch("message");
  const isComposerDisabled =
    conversation?.status === "resolved" || form.formState.isSubmitting;
  const hasMessage = messageValue.trim().length > 0;

  const handleEnhanceResponse = async () => {
    if (!hasMessage) {
      return;
    }

    setIsEnhancing(true);
    const currentValue = form.getValues("message");

    try {
      const response = await enhanceResponse({ prompt: currentValue });

      form.setValue("message", response, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  }
  const createMessage = useMutation(api.private.messages.create)

  const onsubmit = async (data: z.infer<typeof formSchema>) => {
   try {
    await createMessage({
      conversationId,
      prompt: data.message,
    });

    form.reset();
   } catch (error) {
    
   }
  }

const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const updateConversationStatus = useMutation(api.private.conversations.updateStatus);
  const handleToggleStatus = async () => {
    if (!conversation) {
      return;
    }

    setIsUpdatingStatus(true);

    let newStatus: "unresolved" | "resolved" | "escalated";

    // Cycle through states: unresolved -> escalated -> resolved -> unresolved
    if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else if (conversation.status === "escalated") {
      newStatus = "resolved"
    } else {
      newStatus = "unresolved"
    }

    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
if (conversation === undefined || messages.status === "LoadingFirstPage") {
    return <ConversationIdViewLoading />
  }

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-muted">
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon className="size-4" />
        </Button>
         {!!conversation && (
          <ConversationStatusButton
            onClick={handleToggleStatus}
            status={conversation.status}
            disabled={isUpdatingStatus}
          />
        )}
      </div>
      <AIConversation className="flex-1 overflow-hidden">
          <AIConversationContent>
            <InfiniteScrollTrigger 
              onLoadMore={handleLoadMore}
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              ref={topElementRef}
            />
              { toUIMessages(messages.results ?? [])?.map((message) => (
                <AIMessage
                   from={message.role === "user" ? "assistant" : "user"}
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
                disabled={isComposerDisabled}
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
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton
                  disabled={isComposerDisabled || isEnhancing || !hasMessage}
                  onClick={handleEnhanceResponse}
                >
                  <Wand2Icon className="size-4" />
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit 
                disabled={isComposerDisabled || isEnhancing || !hasMessage}
                status={form.formState.isSubmitting ? "submitted" : "ready"}
              />
            </AIInputToolbar>
            </AIInput>
          </Form>
        </div>
    </div>
  )
}

export const ConversationIdViewLoading = () => {
  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button disabled size="sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {Array.from({ length: 8 }, (_, index) => {
            const isUser = index % 2 === 0;
            const widths = ["w-48", "w-60", "w-72"];
            const width = widths[index % widths.length];

            return (
              <div
                className={cn(
                  "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]",
                  isUser ? "is-user" : "is-assistant flex-row-reverse"
                )}
                key={index}
              >
                <Skeleton className={`h-9 ${width} rounded-lg bg-neutral-200`} />
                <Skeleton className="size-8 rounded-full bg-neutral-200" />
              </div>
            );
          })}
        </AIConversationContent>
      </AIConversation>

      <div className="p-2">
        <AIInput>
          <AIInputTextarea
            disabled
            placeholder="Type your response as an operator..."
          />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit disabled status="ready" />
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  );
};
