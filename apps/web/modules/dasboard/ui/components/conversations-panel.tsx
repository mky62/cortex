"use client"

import {
  getCountryForTimezone,
  getCountryFlag,
  getCountryForLocale,
} from "@/lib/country-utils"
import { api } from "@workspace/backend/convex/_generated/api"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { usePaginatedQuery } from "convex/react"
import {
  ListIcon,
  ArrowUp,
  ArrowDown,
  Circle,
  CornerUpLeftIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAtomValue, useSetAtom } from "jotai"
import { statusFilterAtom } from "../../atoms"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"
import { Spinner } from "@workspace/ui/components/spinner"

const statusFilterOptions = [
  {
    value: "all",
    label: "All",
    icon: ListIcon,
  },
  {
    value: "escalated",
    label: "Escalated",
    icon: ArrowUp,
  },
  {
    value: "resolved",
    label: "Resolved",
    icon: ArrowDown,
  },
  {
    value: "unresolved",
    label: "Unresolved",
    icon: Circle,
  },
] as const

export const ConversationsPanel = () => {
  const pathname = usePathname()
  const currentCountry =
    typeof navigator === "undefined"
      ? null
      : getCountryForTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone) ||
        getCountryForLocale(navigator.language)

  const statusFilter = useAtomValue(statusFilterAtom)
  const setStatusFilter = useSetAtom(statusFilterAtom)

  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      initialNumItems: 10,
    }
  )

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
  })

  return (
    <div className="flex h-full w-full flex-col bg-background text-sidebar-foreground">
      <div className="flex flex-col gap-3.5 border-b p-2">
        <Select
          defaultValue="all"
          onValueChange={(value) =>
            setStatusFilter(
              value as "unresolved" | "escalated" | "resolved" | "all"
            )
          }
          value={statusFilter}
        >
          <SelectTrigger className="h-8 w-full border-none px-1.5 shadow-none ring-0 hover:bg-accent">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="size-4" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex w-full flex-col text-sm">
          {isLoadingFirstPage ? (
            <div className="flex justify-center p-4 text-muted-foreground">
              <Spinner className="size-5" />
            </div>
          ) : conversations.results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No conversations found.
            </div>
          ) : (
            conversations.results.map((conversation) => {
              const contactSession = conversation.contactSession
              const contactName = contactSession?.name || "Unknown contact"
              const metadata = contactSession?.metadata

              const isActive = pathname === `/conversations/${conversation._id}`
              const isLastMessageFromOperator =
                conversation.lastMessage?.message?.role !== undefined &&
                conversation.lastMessage.message.role !== "user"

              const country =
                getCountryForTimezone(metadata?.timezone || "") ||
                currentCountry ||
                getCountryForLocale(metadata?.language || metadata?.languages?.[0])

              const countryFlag = country ? getCountryFlag(country.code) : null

              return (
                <Link
                  key={conversation._id}
                  className={cn(
                    "relative flex min-h-16 cursor-pointer items-start gap-3 border-b px-3 py-3 hover:bg-muted/50",
                    isActive && "bg-muted/50"
                  )}
                  href={`/conversations/${conversation._id}`}
                >
                  <div className="flex h-8 w-9 shrink-0 items-center justify-center">
                    {countryFlag ? (
                      <Image
                        src={countryFlag}
                        alt={country?.name || ""}
                        width={28}
                        height={20}
                        className="h-5 w-7 rounded-sm object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="h-5 w-7 rounded-sm bg-muted ring-1 ring-border" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate font-semibold">
                        {contactName}
                      </span>
                      <div className="flex min-w-0 items-center gap-1">
                        {isLastMessageFromOperator && (
                          <CornerUpLeftIcon className="size-3.5 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "truncate text-muted-foreground",
                            !isLastMessageFromOperator && "text-foreground"
                          )}
                        >
                          {conversation.lastMessage?.text || "No messages"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
          {(conversations.results.length > 0 || canLoadMore || isLoadingMore) && (
            <InfiniteScrollTrigger
              onLoadMore={handleLoadMore}
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              ref={topElementRef}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
