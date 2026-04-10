"use client"

import { useAtomValue } from "jotai"
import { AlertTriangleIcon } from "lucide-react"
import { errorMessageAtom } from "../../atoms/widget-atoms"
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"

export const WidgetErrorScreen = () => {
  const errorMessage = useAtomValue(errorMessageAtom)

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between px-2">
          <p>Hi there</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4">
        <AlertTriangleIcon />
        <p>{errorMessage || "Something went wrong"}</p>
      </div>
    </>
  )
}