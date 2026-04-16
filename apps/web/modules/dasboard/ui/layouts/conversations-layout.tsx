"use client"

import { usePathname } from "next/navigation"
import { ConversationsPanel } from "../components/conversations-panel"

export const ConversationsLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const pathname = usePathname()
  const isConversationIndex = pathname === "/conversations"

  return (
    <>
      <div className="flex h-full min-w-0 flex-1 lg:hidden">
        {isConversationIndex ? <ConversationsPanel /> : children}
      </div>
      <div className="hidden h-full min-w-0 flex-1 lg:flex">
        <aside className="h-full w-[360px] min-w-[320px] max-w-[420px] shrink-0 overflow-hidden border-r bg-background">
          <ConversationsPanel />
        </aside>
        <section className="h-full min-w-0 rounded-r-lg flex-1 overflow-hidden bg-background">
          {children}
        </section>
      </div>
    </>
  )
}
