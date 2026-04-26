"use client";

import { Unauthenticated, Authenticated, AuthLoading } from "convex/react";
import { AuthLayout } from "../layouts/auth-layout";
import { SignInView } from "../views/sign-in-view";
import { Loader } from "lucide-react";


export  function AuthGuard({ children }: { children: React.ReactNode }) {
    return (
        <>

            <AuthLoading>
                <AuthLayout>
                    <Loader className="text-blue-600 animate-spin" />
                </AuthLayout>
            </AuthLoading>
            <Authenticated>
                {children}
            </Authenticated>
            <Unauthenticated>
                <AuthLayout>
                    <SignInView />
                </AuthLayout>
            </Unauthenticated >

        </>
    )
}
