"use client"

import { useEffect } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { Loader2 } from "lucide-react"
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import {
  errorMessageAtom,
  loadingMessageAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms"

export const WidgetLoadingScreen = ({ organizationId }: { organizationId: string | null }) => {
  const loadingMessage = useAtomValue(loadingMessageAtom)
  const setLoadingMessage = useSetAtom(loadingMessageAtom)
  const setErrorMessage = useSetAtom(errorMessageAtom)
  const setScreen = useSetAtom(screenAtom)

  useEffect(() => {
    setLoadingMessage("Loading organization")
    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error")
    }
  }, [organizationId, setErrorMessage, setLoadingMessage, setScreen])

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between px-2">
          <p>Hi there</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>
          {loadingMessage || "storming..."}
        </p>
      </div>
    </>
  )
}
