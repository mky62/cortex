"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable"
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
      <ResizablePanelGroup className="hidden h-full min-w-0 lg:flex">
        <ResizablePanel
          className="min-w-0"
          defaultSize={30}
          minSize={25}
          maxSize={40}
        >
          <ConversationsPanel />
        </ResizablePanel>
        <ResizableHandle className="shrink-0" />
        <ResizablePanel className="min-w-0" defaultSize={70} minSize={60}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  )
}
