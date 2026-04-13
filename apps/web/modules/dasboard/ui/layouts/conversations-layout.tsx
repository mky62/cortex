import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";

export const ConversationsLayout = ({
  children
}: { children: React.ReactNode; }) => {
  return (
    <ResizablePanelGroup className="h-full flex-1" >
      <ResizablePanel defaultSize={30} maxSize={30} minSize={20}>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="h-full" defaultSize={70}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};