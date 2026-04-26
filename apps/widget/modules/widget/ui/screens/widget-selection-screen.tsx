"use client"

import { useAtomValue, useSetAtom } from "jotai";
import { screenAtom , conversationIdAtom,hasVapiSecretsAtom, errorMessageAtom, organizationIdAtom, contactSessionIdAtomFamily, widgetSettingsAtom} from "../../atoms/widget-atoms";
import {WidgetHeader} from "../components/widget-header";
import { MessageSquareIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import {  useState } from "react";
import {WidgetFooter} from "../components/widget-footer";
import { MicIcon, ChevronRightIcon} from 'lucide-react'


export const WidgetSelectionScreen = () => {

  const setScreen = useSetAtom(screenAtom);
    const setErrorMessage = useSetAtom(errorMessageAtom);

  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue( contactSessionIdAtomFamily (organizationId || "" ));
  const setConversationId = useSetAtom(conversationIdAtom);


  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const hasVapiSecrets = useAtomValue(hasVapiSecretsAtom);


  const createConversation = useMutation(api.public.conversations.create)
   const [ isPending, setIsPending] = useState(false);


  const handleNewConversations = async () => {
    if (!organizationId) {
      setScreen("error");
      setErrorMessage("Missing organization ID");
      return;
    }

    if ( !contactSessionId) {
      setScreen("auth");
      return;
    }

    setIsPending(true);
    try {
     const conversationId = await createConversation({
      contactSessionId,
      organizationId
     });

     setConversationId(conversationId);
     setScreen("chat");
    } catch {
      setScreen("error");
    }
    finally {
      setIsPending(false)
    }
       
  }

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">
            Hi there! 👋
          </p>
          <p className="text-lg">
            Let&apos;s get you started
          </p>
        </div>
      </WidgetHeader>

      <div className="flex gap-2 flex-1 flex-col p-4">
        <Button
          className="h-12 w-full justify-start rounded-lg"
          disabled={isPending}
          onClick={handleNewConversations}
        >
          <MessageSquareIcon className="mr-2 h-4 w-4" />
          Chat with us 
        </Button>


       {hasVapiSecrets && widgetSettings?.vapiSettings?.assistantId && (
          <Button
            className="h-16 w-full justify-between"
            variant="outline"
            onClick={() => setScreen("voice")}
            disabled={isPending}
          >
            <div className="flex items-center gap-x-2">
              <MicIcon className="size-4" />
              <span>Start voice call</span>
            </div>
            <ChevronRightIcon />
          </Button>
        )}


      </div>
    

     
      <WidgetFooter/>
     
    </>
  )
}
