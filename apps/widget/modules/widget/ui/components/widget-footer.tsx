import React from 'react'
import { Button } from "@workspace/ui/components/button";
import { Ghost, HomeIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export default function WidgetFooter() {

    const screen = "selection";

  return (
    <footer
      className='flex items-center justify-between p-4 border-t'>
        <Button
          className='h-12 p-1 rounded'
          onClick={() => {}}
          variant="ghost">Footer Button</Button>
        <HomeIcon
          className={cn("size-5", screen === "selection" && "text-primary")}
        />
      </footer>
  )
}
