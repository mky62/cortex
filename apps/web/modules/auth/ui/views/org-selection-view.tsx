import React from 'react'
import { OrganizationList } from '@clerk/nextjs'

export function OrgSelectView() {
    return (
        <OrganizationList
            afterCreateOrganizationUrl="/"
            afterSelectOrganizationUrl="/"
            hidePersonal
            skipInvitationScreen
        />

    )
}
