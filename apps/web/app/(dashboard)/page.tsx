'use client'

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api"


export default function Page() {
  const users = useQuery(api.users.getMany)
  const addUser = useMutation(api.users.add)

  return (
    <>
      <div>
        <p>app</p>
        <OrganizationSwitcher />
        <Button onClick={() => addUser()}>addUser</Button>
        <UserButton />
        <div>
          {JSON.stringify(users, null, 2)}
        </div>
      </div>
    </>

  )
}
