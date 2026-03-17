'use client'

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/Button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api"
import { Authenticated, Unauthenticated } from "convex/react";


export default function Page() {
  const users = useQuery(api.users.getMany)
  const addUser = useMutation(api.users.add)

  return (
    <>
      <Authenticated>
        <div>
          <p>app</p>
          <Button onClick={() => addUser()}>addUser</Button>
          <UserButton />
          <div>
            {JSON.stringify(users, null, 2)}
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <p>unauthenticated must sign </p>
        <SignInButton />
      </Unauthenticated>
    </>

  )
}
