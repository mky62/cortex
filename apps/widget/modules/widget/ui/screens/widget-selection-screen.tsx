"use client"

import { useAtomValue, useSetAtom } from "jotai";
import { screenAtom , conversationIdAtom,hasVapiSecretsAtom, errorMessageAtom, organizationIdAtom, contactSessionIdAtomFamily, widgetSettingsAtom} from "../../atoms/widget-atoms";
import {WidgetHeader} from "../components/widget-header";
import { MessageSquareIcon, PhoneCallIcon } from "lucide-react";
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
  disabled={isPending}
  onClick={handleNewConversations}
  className="
    group relative h-12 w-full overflow-hidden
    justify-start rounded-2xl
    border border-blue-200/70
    bg-gradient-to-r from-white via-blue-50 to-blue-100
    px-4 text-blue-900
    shadow-sm transition-all duration-300 ease-out

    hover:scale-[1.01]
    hover:border-blue-300
    hover:shadow-md
    hover:from-blue-50
    hover:to-blue-100

    active:scale-[0.98]
    disabled:opacity-60
    disabled:hover:scale-100
  "
>
  {/* subtle shine */}
  <span
    className="
      pointer-events-none absolute inset-0
      -translate-x-full
      bg-gradient-to-r from-transparent via-white/60 to-transparent
      transition-transform duration-700 ease-out
      group-hover:translate-x-full
    "
  />

  {/* soft glow */}
  <span
    className="
      pointer-events-none absolute left-2 top-1/2
      size-12 -translate-y-1/2 rounded-full
      bg-blue-200/40 blur-2xl
      transition-all duration-500
      group-hover:scale-125
    "
  />

  <div className="relative z-10 flex items-center">
    <span
      className="
        mr-3 flex size-8 items-center justify-center
        rounded-xl bg-blue-100
        ring-1 ring-blue-200
        transition-all duration-300
        group-hover:scale-110
      "
    >
      <MessageSquareIcon className="h-4 w-4 text-blue-700" />
    </span>

    <span className="font-medium tracking-wide">
      Chat with us
    </span>
  </div>
</Button>
        {hasVapiSecrets && widgetSettings?.vapiSettings?.assistantId && (
          <Button
            variant="outline"
            onClick={() => setScreen("voice")}
            disabled={isPending}
            className="
              group relative h-16 w-full overflow-hidden justify-between
              rounded-2xl border border-blue-300/30
              bg-gradient-to-r from-slate-950 via-blue-500 to-cyan-600
              px-4 text-white shadow-lg shadow-blue-500/20
              transition-all duration-300 ease-out
              hover:scale-[1.02] hover:border-blue-300/60
              hover:shadow-xl hover:shadow-blue-500/30
              active:scale-[0.98]
              disabled:opacity-60 disabled:hover:scale-100
            "
          >
            {/* animated voice waves */}
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 opacity-20">
              <span className="h-6 w-1 rounded-full bg-white animate-pulse" />
              <span className="h-10 w-1 rounded-full bg-white animate-pulse delay-150" />
              <span className="h-8 w-1 rounded-full bg-white animate-pulse delay-300" />
              <span className="h-12 w-1 rounded-full bg-white animate-pulse delay-500" />
              <span className="h-7 w-1 rounded-full bg-white animate-pulse delay-700" />
            </span>

            {/* shine effect */}
            <span
              className="
                pointer-events-none absolute inset-0 -translate-x-full
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                transition-transform duration-700 ease-out
                group-hover:translate-x-full
              "
            />

            {/* mic glow */}
            <span
              className="
                pointer-events-none absolute left-4 top-1/2 size-14
                -translate-y-1/2 rounded-full bg-cyan-400/20 blur-2xl
                transition-all duration-500 group-hover:scale-150
              "
            />

            <div className="relative z-10 flex items-center gap-x-3">
              <span
                className="
                  relative flex size-10 items-center justify-center rounded-full
                  bg-white/10 backdrop-blur-md
                  ring-1 ring-white/20
                  transition-all duration-300
                  group-hover:scale-110 group-hover:bg-white/20
                "
              >
                <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
                <MicIcon className="relative z-10 size-5" />
              </span>

              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-semibold tracking-wide">
                  Start voice call
                </span>
                <span className="mt-1 text-xs text-blue-100/70">
                  Talk with AI assistant
                </span>
              </div>
            </div>

            <ChevronRightIcon
              className="
                relative z-10 size-5 transition-all duration-300
                group-hover:translate-x-1 group-hover:scale-110
              "
            />
          </Button>
        )}

        {hasVapiSecrets && widgetSettings?.vapiSettings?.phoneNumber && (
          <Button
      onClick={() => setScreen("contact")}
      disabled={isPending}
      className="
        group relative h-12 w-full overflow-hidden justify-between
        rounded-2xl border border-emerald-300/30
        bg-gradient-to-r from-emerald-600 via-green-500 to-lime-500
        px-4 text-white shadow-lg shadow-emerald-500/30
        transition-all duration-300 ease-out
        hover:scale-[1] hover:shadow-xl hover:shadow-emerald-500/40
        active:scale-[0.98]
        disabled:opacity-60 disabled:hover:scale-80 disabled:hover:shadow-lg disabled:hover:shadow-emerald-500/30
      "
    >
      {/* animated shine */}
      <span
        className="
          pointer-events-none absolute inset-0 -translate-x-full
          bg-gradient-to-r from-transparent via-white/30 to-transparent
          transition-transform duration-700 ease-out
          group-hover:translate-x-full
        "
      />

      {/* soft glow blob */}
      <span
        className="
          pointer-events-none absolute -left-8 top-1/2 size-20
          -translate-y-1/2 rounded-full bg-white/20 blur-2xl
          transition-all duration-500 group-hover:left-full
        "
      />

      <div className="relative z-10 flex items-center gap-x-3">
        <span
          className="
            flex size-8 items-center justify-center rounded-full
            bg-white/20 backdrop-blur-sm
            transition-transform duration-300
            group-hover:rotate-12 group-hover:scale-80
          "
        >
          <PhoneCallIcon className="size-4 animate-pulse" />
        </span>

        <span className="font-medium tracking-wide">
          Call Us
        </span>
      </div>

      <ChevronRightIcon
        className="
          relative z-10 size-5 transition-all duration-300
          group-hover:translate-x-1 group-hover:scale-50
        "
      />
    </Button>
        )}

      </div>
    

     
      <WidgetFooter/>
     
    </>
  )
}
