import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@workspace/ui/components/resizable"
import { ConversationsPanel } from "../components/conversations-panel"


export const ConversationsLayout = () => ({
  children
}: { children: React.ReactNode; }) => {
  return (
    <ResizablePanelGroup className="h-full">
      <ResizablePanel defaultSize={20}>
        <ConversationsPanel />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
