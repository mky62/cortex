"use client"

import { useAtomValue, useSetAtom } from "jotai"
import { useQuery } from "convex/react"
 import { screenAtom, errorMessageAtom , organizationIdAtom , conversationIdAtom, contactSessionIdAtomFamily} from "../../atoms/widget-atoms"
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import { ArrowBigLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button";
import { api } from "@workspace/backend/convex/_generated/api";
import { use } from "react"

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom)
  const setConversationId = useSetAtom(conversationIdAtom)
  const conversationId = useAtomValue(conversationIdAtom)
  const organizationId = useAtomValue(organizationIdAtom)
  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || '' ))
  const errorMessage = useAtomValue(errorMessageAtom)

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId ? {
      conversationId, 
      contactSessionId,
    } : "skip"
  )
   
  const onBack = () => {
    setConversationId(null);
    setScreen("selection")
  }

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
       <div className="flex items-center gap-2">
        <Button
        size="icon"
        variant="ghost"
        onClick={onBack}
        >
        <ArrowBigLeft /> 
        </Button>
        <p>Chat</p>
       </div>
      </WidgetHeader>
      </>
  )
}