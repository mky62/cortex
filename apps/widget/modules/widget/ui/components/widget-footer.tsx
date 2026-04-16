import React from 'react'
import { Button } from "@workspace/ui/components/button";
import { InboxIcon, HomeIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useAtomValue, useSetAtom } from 'jotai';
import { screenAtom } from '../../atoms/widget-atoms';

export function WidgetFooter() {

    const screen = useAtomValue(screenAtom)
    const setScreen = useSetAtom(screenAtom)

  return (
    <footer className='grid grid-cols-2 gap-2 border-t bg-background p-2'>
      <Button
        aria-label="Home"
        className={cn(
          'h-10 rounded-md text-muted-foreground',
          screen === "selection" && "bg-primary/10 text-primary"
        )}
        onClick={() => setScreen("selection")}
        variant="ghost"
      >
        <HomeIcon className="size-5" />
      </Button>
      <Button
        aria-label="Inbox"
        className={cn(
          'h-10 rounded-md text-muted-foreground',
          screen === "inbox" && "bg-primary/10 text-primary"
        )}
        onClick={() => setScreen("inbox")}
        variant="ghost"
      >
        <InboxIcon className="size-5" />
      </Button>
    </footer>
  )
}
