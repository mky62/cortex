import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { WidgetScreen } from "../types";
import { atomFamily } from 'jotai-family'
import { CONTACT_SESSION_KEY } from "../constants";
import { Id } from "@workspace/backend/convex/_generated/dataModel"

type WidgetSettings = {
    defaultSuggestions: Record<string, string>
}

export const screenAtom = atom<WidgetScreen>("loading")

export const organizationIdAtom = atom<string | null>(null)
export const errorMessageAtom = atom<string | null>(null)
export const loadingMessageAtom = atom<string | null>(null)
export const conversationIdAtom = atom<Id<"conversations"> | null>(null)
export const widgetSettingsAtom = atom<WidgetSettings>({
    defaultSuggestions: {
        support: "I need help with my account",
        billing: "I have a billing question",
        product: "Tell me more about the product",
    },
})
export const contactSessionIdAtomFamily = 
atomFamily(( organizationId: string) => {
    return atomWithStorage<Id<"contactSessions"> | null>(`${CONTACT_SESSION_KEY}_${organizationId}`, null )
});

