"use client";

import React from 'react'

import { useAtomValue } from 'jotai';
import { screenAtom } from '@/modules/widget/atoms/widget-atoms';
import { WidgetAuthScreen } from '../screens/widget-auth-screen';
import { WidgetErrorScreen } from '../screens/widget-error-screen';
import { WidgetLoadingScreen } from '../screens/widget-loading-screen';

interface organizationProps {
    organizationId: string
    }

export const WidgetView = ({ organizationId }: organizationProps) => {

  const screen = useAtomValue(screenAtom);

  const screenComponents = {
    error: <WidgetErrorScreen/>,
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    auth: <WidgetAuthScreen />,
    chat: <p>TODO</p>,
    contact: <p></p>,
    inbox: <p></p>,
    selection: <p></p>,
    voice: <p></p>,
  }

  return (
    <main
    className='flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted'>
     {screenComponents[screen]}
    </main>
   
  )
}
