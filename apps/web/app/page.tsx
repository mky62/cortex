'use client'

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api"

export default function Page() {
  const users = useQuery(api.users.getMany)
  return (
    <div>
      {JSON.stringify(users)}
    </div>
  )
}
