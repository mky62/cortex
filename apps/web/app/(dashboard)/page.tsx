'use client'

import Link from "next/link";
import type { ComponentType } from "react";
import { useOrganization } from "@clerk/nextjs";
import { usePaginatedQuery, useQuery } from "convex/react";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  BotIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FileTextIcon,
  InboxIcon,
  MessageSquareTextIcon,
  MicIcon,
  PaletteIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  UploadIcon,
} from "lucide-react";

import { api } from "@workspace/backend/convex/_generated/api"
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

const STATUS_META = {
  unresolved: {
    label: "Unresolved",
    icon: AlertCircleIcon,
    className: "text-amber-600",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
  escalated: {
    label: "Escalated",
    icon: Clock3Icon,
    className: "text-blue-600",
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2Icon,
    className: "text-emerald-600",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
} as const;

type ConversationStatus = keyof typeof STATUS_META;

export default function Page() {
  const { organization } = useOrganization();

  const unresolved = usePaginatedQuery(
    api.private.conversations.getMany,
    { status: "unresolved" },
    { initialNumItems: 50 },
  );
  const escalated = usePaginatedQuery(
    api.private.conversations.getMany,
    { status: "escalated" },
    { initialNumItems: 50 },
  );
  const resolved = usePaginatedQuery(
    api.private.conversations.getMany,
    { status: "resolved" },
    { initialNumItems: 50 },
  );
  const files = usePaginatedQuery(
    api.private.files.list,
    {},
    { initialNumItems: 8 },
  );
  const widgetSettings = useQuery(api.private.widgetSettings.getOne);
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });

  const conversationBuckets = {
    unresolved,
    escalated,
    resolved,
  };

  const isLoadingConversations = Object.values(conversationBuckets).some(
    (bucket) => bucket.status === "LoadingFirstPage",
  );
  const isLoadingFiles = files.status === "LoadingFirstPage";

  const recentConversations = [
    ...unresolved.results,
    ...escalated.results,
    ...resolved.results,
  ]
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 5);

  const totalConversations =
    unresolved.results.length + escalated.results.length + resolved.results.length;

  const readyFiles = files.results.filter((file) => file.status === "ready").length;
  const hasSuggestions = Boolean(
    widgetSettings?.defaultSuggestions.suggestion1 ||
      widgetSettings?.defaultSuggestions.suggestion2 ||
      widgetSettings?.defaultSuggestions.suggestion3,
  );

  const setupItems = [
    {
      label: "Widget copy",
      description: "Greeting and suggested prompts",
      href: "/customization",
      complete: Boolean(widgetSettings?.greetMessage && hasSuggestions),
      icon: PaletteIcon,
    },
    {
      label: "Knowledge base",
      description: "Indexed files for support answers",
      href: "/files",
      complete: readyFiles > 0,
      icon: FileTextIcon,
    },
    {
      label: "Voice assistant",
      description: "Vapi connection for calls",
      href: "/plugins/vapi",
      complete: Boolean(vapiPlugin),
      icon: MicIcon,
    },
  ];

  return (
    <div className="min-h-screen overflow-y-auto bg-muted/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit" variant="outline">
              <SparklesIcon />
              Operator dashboard
            </Badge>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
                {organization?.name ?? "Support workspace"}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Monitor live support load, keep your assistant configured, and move quickly into the queues that need attention.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/files">
                <UploadIcon />
                Add knowledge
              </Link>
            </Button>
            <Button asChild>
              <Link href="/conversations">
                <InboxIcon />
                Open inbox
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          {(Object.keys(STATUS_META) as ConversationStatus[]).map((status) => {
            const meta = STATUS_META[status];
            const Icon = meta.icon;
            const bucket = conversationBuckets[status];

            return (
              <Card key={status} className="rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className={meta.className} />
                    {meta.label}
                  </CardTitle>
                  <CardAction>
                    <Badge className={meta.badgeClassName} variant="outline">
                      {bucket.status === "LoadingFirstPage" ? "..." : bucket.results.length}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold tracking-normal">
                    {bucket.status === "LoadingFirstPage" ? (
                      <Skeleton className="h-9 w-16" />
                    ) : (
                      bucket.results.length
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {status === "unresolved" && "Waiting for AI or operator action"}
                    {status === "escalated" && "Needs a human response"}
                    {status === "resolved" && "Closed conversations loaded"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-lg">
            <CardHeader>
              <div>
                <CardTitle>Recent conversations</CardTitle>
                <CardDescription>
                  Latest activity across all loaded conversation states.
                </CardDescription>
              </div>
              <CardAction>
                <Button asChild size="sm" variant="outline">
                  <Link href="/conversations">
                    View all
                    <ArrowRightIcon />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoadingConversations ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton className="h-16 w-full" key={index} />
                ))
              ) : recentConversations.length > 0 ? (
                recentConversations.map((conversation) => {
                  const status = conversation.status as ConversationStatus;
                  const meta = STATUS_META[status];
                  const visitorName = conversation.contactSession?.name ?? "Unknown visitor";
                  const visitorEmail = conversation.contactSession?.email ?? "No email";

                  return (
                    <Link
                      className="flex items-center justify-between gap-4 rounded-lg border bg-background px-4 py-3 transition-colors hover:bg-muted/50"
                      href={`/conversations/${conversation._id}`}
                      key={conversation._id}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {conversation.type === "voice" ? (
                            <MicIcon className="size-4 text-muted-foreground" />
                          ) : (
                            <MessageSquareTextIcon className="size-4 text-muted-foreground" />
                          )}
                          <p className="truncate text-sm font-medium">{visitorName}</p>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {visitorEmail}
                        </p>
                      </div>
                      <Badge className={meta.badgeClassName} variant="outline">
                        {meta.label}
                      </Badge>
                    </Link>
                  );
                })
              ) : (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-background text-center">
                  <InboxIcon className="size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">No conversations yet</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    New chat and voice sessions will appear here once visitors start using the widget.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Assistant readiness</CardTitle>
                <CardDescription>
                  Keep the customer widget ready before traffic arrives.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {setupItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      className="flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
                      href={item.href}
                      key={item.label}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.label}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {item.complete ? (
                        <CheckCircle2Icon className="size-4 text-emerald-600" />
                      ) : (
                        <ArrowRightIcon className="size-4 text-muted-foreground" />
                      )}
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Workspace health</CardTitle>
                <CardDescription>
                  Current support assets loaded for this organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <HealthRow
                  icon={BotIcon}
                  label="Loaded conversations"
                  loading={isLoadingConversations}
                  value={totalConversations.toString()}
                />
                <HealthRow
                  icon={ShieldCheckIcon}
                  label="Ready knowledge files"
                  loading={isLoadingFiles}
                  value={readyFiles.toString()}
                />
                <HealthRow
                  icon={Settings2Icon}
                  label="Voice integration"
                  loading={vapiPlugin === undefined}
                  value={vapiPlugin ? "Connected" : "Not connected"}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

function HealthRow({
  icon: Icon,
  label,
  loading,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  loading: boolean;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="truncate text-sm text-muted-foreground">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="h-5 w-16" />
      ) : (
        <p className="shrink-0 text-sm font-medium">{value}</p>
      )}
    </div>
  );
}
