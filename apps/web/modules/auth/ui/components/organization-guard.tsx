import React from 'react'
import { useOrganization } from '@clerk/nextjs'
import { AuthLayout } from '../layouts/auth-layout'
import { OrgSelectView } from '@/modules/auth/ui/views/org-selection-view'

export function OrganizationGuard({ children }: { children: React.ReactNode }) {
    const { organization } = useOrganization();

    if (!organization) {

        <AuthLayout>
            <OrgSelectView />
        </AuthLayout>
    }
    return (
        <div>
            {children}
        </div>
    )
}