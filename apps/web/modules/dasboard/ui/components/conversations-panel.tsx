"use client"

import { getCountryForTimezone, getCountryFlag } from "@/lib/country-utils"
import { api } from "@workspace/backend/convex/_generated/api"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@workspace/ui/components/select"
import { usePaginatedQuery } from "convex/react";
import { ListIcon, ArrowUp, ArrowDown, Circle, Link, CornerUpLeftIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai"
import { statusFilterAtom } from "../../atoms"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"


export const ConversationsPanel = () => {
    const pathname = usePathname();

    const statusFilter = useAtomValue(statusFilterAtom);
    const setStatusFilter = useSetAtom(statusFilterAtom);

    const conversations = usePaginatedQuery(
        api.private.conversations.getMany,
        {
            status:
            statusFilter === "all" ? undefined : statusFilter
        },
        {
            initialNumItems: 10
        }
    );

    const {
        topElementRef,
        handleLoadMore,
        canLoadMore,
        isLoadingMore,
        isLoadingFirstPage,
    } = useInfiniteScroll({
        status: conversations.status,
        loadMore: conversations.loadMore,
        loadSize:  10,
    })
    return (
        <div className="flex h-full w-full flex-col bg-background text-sidebar-foreground">
            <div className="flex flex-col gap-3.5 border- p-2">
                <Select
                    defaultValue="all"
                    onValueChange={(value) => setStatusFilter(value as "unresolved" | "escalated" | "resolved" | "all")}
                    value={statusFilter}>
                    <SelectTrigger className="h-8 border-none px-1.5 shadow-none ring-0 hover:bg-accent">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" >
                            <div className="flex -items-centr gap-2">
                                <ListIcon className="size-4" />
                                <span>All</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="all" >
                            <div className="flex -items-centr gap-2">
                                <ArrowUp className="size-4" />
                                <span>Escalated</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="all" >
                            <div className="flex -items-centr gap-2">
                                <ArrowDown className="size-4" />
                                <span>Resolved</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="all" >
                            <div className="flex -items-centr gap-2">
                                <Circle className="size-4" />
                                <span>Unresolved</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ScrollArea
                className="max-h-[calc(100vh-100px)]">
                <div className="flex w-full flex-1 flex-col text-sm"></div>
                {conversations.results.map((conversation) => {
                    const isLastMessageFromOperator =
                    conversation.lastMessage?.message?.role !== "user"

                    const country = getCountryForTimezone(
                        conversation.contactSession.metadata?.timezone || ""
                    );

                    const countryFlag = getCountryFlag(country?.code || "");
                    
                    return (
                       <Link
                       key={conversation._id}
                       className={cn("flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer",
                        pathname === `/conversations/${conversation._id}` && "bg-muted/50"
                       )}
                       href={`/conversations/${conversation._id}`}>


                       <div
                       className={cn("-translate-y-1/2 absolute top-1/2 left-0 w-2 h-2 rounded-full bg-green-500",
                        pathname === `/conversations/${conversation._id}` && "bg-blue-500"
                       )}>

                        <div>
                            {countryFlag && (
                                <Image
                                src={countryFlag}
                                alt={country?.name || ""}
                                className="h-4 w-4 rounded-full"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex w-full items-center gap-2">
                                <span className="truncate font-bold">
                                    {conversation.contactSession.name}
                                </span>
                                 <div className="mt-1 flex items-center justify-between gap-2">
                                    <div className="flex w-0 grow items-center gap-1">
                                        {isLastMessageFromOperator && (
                                           <CornerUpLeftIcon className="h-4 w-4" />
                                        )}
                                        <span
                                        className={cn("line-clamp-1 text-muted-foreground",
                                            !isLastMessageFromOperator && "text-foreground"
                                        )}>
                                            {conversation.lastMessage?.text || "No messages"} 
                                        </span>
                                    </div>
                                 </div>
                            </div>
                        </div>
                       </div>
                       </Link>
                         
                    )
                })}
                <InfiniteScrollTrigger
                onLoadMore={handleLoadMore}
                canLoadMore={canLoadMore}
                isLoadingMore={isLoadingMore}
                ref={topElementRef}
                />
            </ScrollArea>
        </div>
    )
}