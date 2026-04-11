'use client'

import { use } from "react";
import { WidgetView } from "../modules/widget/ui/views/widegt-view";

interface organizationProps {
  searchParams: Promise<{
    organizationId: string
  }>
}

export default function Page({ searchParams }: organizationProps) {
  const { organizationId } = use(searchParams);

    return (
      <WidgetView organizationId={organizationId} />
    )
}
