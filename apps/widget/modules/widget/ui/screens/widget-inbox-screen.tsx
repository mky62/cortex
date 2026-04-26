"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeftIcon, MicIcon, MessageCircleIcon } from "lucide-react";
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom } from "@/modules/widget/atoms/widget-atoms";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { WidgetFooter } from "../components/widget-footer";
import { Button } from "@workspace/ui/components/button";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";

export const WidgetInboxScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId
      ? {
          contactSessionId,
        }
      : "skip",
    {
      initialNumItems: 10,
    },
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
  });

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Inbox</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-auto">
        {conversations?.results.length > 0 &&
          conversations?.results.map((conversation) => {
            const isVoice = conversation.type === "voice";
            const isChat = !conversation.type || conversation.type === "chat";
            const lastTranscript = isVoice
              ? conversation.voiceTranscript?.[conversation.voiceTranscript.length - 1]
              : null;
            const previewText = isVoice
              ? lastTranscript?.text || "Voice call"
              : conversation.lastMessage?.text;

            return (
              <Button
                className="h-20 w-full justify-between"
                key={conversation._id}
                onClick={() => {
                  if (isChat) {
                    setConversationId(conversation._id);
                    setScreen("chat");
                  }
                }}
                variant="outline"
                disabled={isVoice}
              >
                <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                  <div className="flex w-full items-center justify-between gap-x-2">
                    <div className="flex items-center gap-x-1">
                      {isVoice ? (
                        <MicIcon className="size-3 text-muted-foreground" />
                      ) : (
                        <MessageCircleIcon className="size-3 text-muted-foreground" />
                      )}
                      <p className="text-muted-foreground text-xs">
                        {isVoice ? "Voice" : "Chat"}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(conversation._creationTime))}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-x-2">
                    <p className="truncate text-sm">{previewText}</p>
                    {!isVoice && (
                      <ConversationStatusIcon status={conversation.status} className="shrink-0" />
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
        <InfiniteScrollTrigger
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          ref={topElementRef}
        />
      </div>
      <WidgetFooter />
    </>
  );
};