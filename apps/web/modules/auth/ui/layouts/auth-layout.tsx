import React from 'react'

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen justify-center items-center flex w-full">
            {children}
        </div>
    )
}
