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
    <footer
      className='flex items-center justify-between p-4 border-t'>
        <Button
          className='h-12 p-1 rounded'
          onClick={() => setScreen("selection")}
          variant="ghost">
     <HomeIcon
          className={cn("size-5", screen === "selection" && "text-primary")}
        />
          </Button>
          <Button
          onClick={() => setScreen("inbox")}>
           <InboxIcon
           className={cn("size-5", screen === "inbox" && "text-primary" )} />
          </Button>
        
      </footer>
  )
}
