"use client"

import { useEffect, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { useAction, useMutation , useQuery} from "convex/react"
import { Loader2 } from "lucide-react"
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import { api } from "@workspace/backend/convex/_generated/api"
import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
  widgetSettingsAtom
} from "@/modules/widget/atoms/widget-atoms"

type InitStep = "org" | "auth" | "session" | "settings" | "vapi" | "done"

export const WidgetLoadingScreen = ({ organizationId }: { organizationId: string | null }) => {
  const setWidgetSettings = useSetAtom(widgetSettingsAtom);
  const [step, setStep] = useState<InitStep>("org")
  const [sessionValid, setSessionValid] = useState(false)

  const loadingMessage = useAtomValue(loadingMessageAtom)
  const setLoadingMessage = useSetAtom(loadingMessageAtom)
  const setOrganizationId = useSetAtom(organizationIdAtom)
  const setErrorMessage = useSetAtom(errorMessageAtom)
  const setScreen = useSetAtom(screenAtom)

  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""))

  const validateOrganization = useAction(api.public.organizations.validate)
  const validateContactSession = useMutation(api.public.contactSessions.validate)

  useEffect(() => {
    if (step !== "org") return
  
    setLoadingMessage("Finding organization")

    if (!organizationId) {
      setErrorMessage("Organization ID is required")
      setScreen("error")
      return
    }

    setLoadingMessage("Verifying...")


    validateOrganization({ organizationId })
      .then((result) => {
        if (result.valid) {
          setOrganizationId(organizationId)
          setStep("session")
          return
        }

        setErrorMessage(result.reason ?? "Organization is invalid")
        setScreen("error")
      })
      .catch(() => {
        setErrorMessage("Failed to validate organization")
        setScreen("error")
      })
  }, [
    step,
    organizationId,
    setErrorMessage,
    setLoadingMessage,
    setOrganizationId,
    setStep,
    setScreen,
    validateOrganization,
  ])

  useEffect(() => {
    if (step !== "session") return

    setLoadingMessage("Checking session")  



    if (!contactSessionId) {
      setSessionValid(false)
      setStep("settings")
      return
    }

    setLoadingMessage("Finding contact session")

    validateContactSession({contactSessionId})
      .then((result) => {
        setSessionValid(result.valid)
        setStep("settings")
      })
      .catch(() => {
        setSessionValid(false)
        setStep("settings")
      })
  }, [setLoadingMessage, contactSessionId ,step, validateContactSession])

    const widgetSettings = useQuery(api.public.widgetSettings.getByOrganizationId, 
    organizationId ? {
      organizationId,
    } : "skip",
  );
  
  useEffect(() => {
  if (step !== "settings") return;

  setLoadingMessage("Loading widget settings...");

  if (widgetSettings === undefined) return;

  if (widgetSettings === null) {
    setErrorMessage("Widget settings not found");
    setScreen("error");
    return;
  }

  setWidgetSettings(widgetSettings);
  setStep("done");
}, [
  step,
  widgetSettings,
  setWidgetSettings,
  setLoadingMessage,
  setErrorMessage,
  setScreen,
]);


  useEffect(() => {
    if (step !== "done") return;

    const hasValidSesison = contactSessionId && sessionValid;
    setScreen(hasValidSesison ? "selection" : "auth")
  }, [sessionValid,contactSessionId, setScreen, step])

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
