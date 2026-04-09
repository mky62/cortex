"use client";

import React from 'react'
import { WidgetAuthScreen } from '../screens/widget-auth-screen';



interface organizationProps {
    organizationId: string
    }

export default function WidgetView({ organizationId }: organizationProps) {
  return (
    <main
    className='flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted'>
      <WidgetAuthScreen />
    </main>
   
  )
}
