import { atom } from "jotai";
import { WidgetScreen } from "../types";


export const screenAtom = atom<WidgetScreen>("loading")

export const errorMessageAtom = atom<string | null>(null)
export const loadingMessageAtom = atom<string | null>(null)