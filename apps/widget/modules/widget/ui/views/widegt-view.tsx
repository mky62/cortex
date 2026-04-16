"use client";

import React from 'react'

import { useAtomValue } from 'jotai';
import { screenAtom } from '@/modules/widget/atoms/widget-atoms';
import { WidgetAuthScreen } from '@/modules/widget/ui/screens/widget-auth-screen'
import { WidgetErrorScreen } from '@/modules/widget/ui/screens/widget-error-screen';
import { WidgetLoadingScreen } from '@/modules/widget/ui/screens/widget-loading-screen';
import { WidgetSelectionScreen } from '@/modules/widget/ui/screens/widget-selection-screen';
import { WidgetChatScreen } from '@/modules/widget/ui/screens/widget-chat-screen';
import { WidgetInboxScreen } from '@/modules/widget/ui/screens/widget-inbox-screen';

interface organizationProps {
    organizationId: string
    }

export const WidgetView = ({ organizationId }: organizationProps) => {

  const screen = useAtomValue(screenAtom);

  const screenComponents = {
    error: <WidgetErrorScreen/>,
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    auth: <WidgetAuthScreen />,
    chat: <WidgetChatScreen />,
    contact: <p></p>,
    inbox: <WidgetInboxScreen />,
    selection: <WidgetSelectionScreen />,
    voice: <p></p>,
  }

  return (
    <main className='flex h-dvh w-full flex-col overflow-hidden rounded-xl border bg-muted'>
     {screenComponents[screen]}
    </main>
   
  )
}
