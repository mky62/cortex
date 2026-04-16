"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { MessageSquareDashedIcon } from "lucide-react";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { useForm } from "react-hook-form"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react"
import { useAtomValue, useSetAtom } from "jotai"
import { useAction, useQuery } from "convex/react"
import { screenAtom , organizationIdAtom , conversationIdAtom, contactSessionIdAtomFamily, widgetSettingsAtom} from "../../atoms/widget-atoms"
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import { ArrowBigLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button";
import { api } from "@workspace/backend/convex/_generated/api";
import { Form, FormField } from "@workspace/ui/components/form";
import { useMemo } from "react";


import {
  AIConversation,
  AIConversationContent,
} from "@workspace/ui/components/ai/conversation"

import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
  AIInputSubmit,
} from "@workspace/ui/components/ai/input"

import {
  AIMessage,
  AIMessageContent,
  
} from "@workspace/ui/components/ai/message"

import {
  AISuggestion,
  AISuggestions,

} from "@workspace/ui/components/ai/suggestion"

import { AIResponse } from "@workspace/ui/components/ai/response"

const formSchema = z.object({
  message: z.string().min(1, "Mesage is required")
})

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom)
  const setConversationId = useSetAtom(conversationIdAtom)
  const conversationId = useAtomValue(conversationIdAtom)
  const organizationId = useAtomValue(organizationIdAtom)
  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || '' ))

  const widgetSettings = useAtomValue(widgetSettingsAtom);

   const onBack = () => {
    setConversationId(null);
    setScreen("selection")
  }

   const suggestions = useMemo(() => {
    if (!widgetSettings) {
      return [];
    }

      return Object.keys(widgetSettings.defaultSuggestions).map((key) => {
      return widgetSettings.defaultSuggestions[
        key as keyof typeof widgetSettings.defaultSuggestions
      ];
    });
  }, [widgetSettings]);

   const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        } 
      : "skip"
  );

   const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
    ? {
      threadId: conversation.threadId,
      contactSessionId,
    }
    : "skip",
    { initialNumItems: 10}
   );

  
  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10,
  });

   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: ""
    }
   })

   const createMessage = useAction(api.public.messages.create);
   const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) return;


   form.reset();

    await createMessage({
      threadId: conversation?.threadId,
      prompt: values.message,
      contactSessionId,
     })

   }



  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
       <div className="flex items-center gap-2">
        <Button
        size="icon"
        variant="ghost"
        onClick={onBack}
        >
        <ArrowBigLeft /> 
        </Button>
        <p>Chat</p>
       </div>
      </WidgetHeader>
      <AIConversation>
      <AIConversationContent className="mx-auto flex w-full max-w-3xl flex-col px-4 py-6">
        <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
        {toUIMessages(messages.results ?? [])?.map((message) => {
          return (
            <AIMessage
            from={message.role === "user" ? "user" : "assistant"}
            key={message.id}>
              <AIMessageContent>
                <AIResponse>{message.text}</AIResponse>
              </AIMessageContent>
               {message.role === "assistant" && (
                  <MessageSquareDashedIcon
                    seed="assistant"
                    size={32}
                  />
                )}
            </AIMessage>
          )
        }) }
      </AIConversationContent>
      </AIConversation>
            {toUIMessages(messages.results ?? [])?.length === 1 && (
        <AISuggestions className="flex w-full flex-col items-end p-2">
          {suggestions.map((suggestion) => {
            if (!suggestion) {
              return null;
            }

            return (
              <AISuggestion
                key={suggestion}
                onClick={() => {
                  form.setValue("message", suggestion, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                  form.handleSubmit(onSubmit)();
                }}
                suggestion={suggestion}
              />
            )
          })}
        </AISuggestions>
      )}
      <div className="border-t bg-background p-3">
      <div className="mx-auto w-full max-w-3xl">
      <Form {...form}>
          <AIInput
            className="rounded-lg"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={conversation?.status === "resolved"}
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved."
                      : "Type your message..."
                  }
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools />
              <AIInputSubmit
                disabled={conversation?.status === "resolved" || !form.formState.isValid}
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
      </Form>
      </div>
      </div>
      </>
  )
}
