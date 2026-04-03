import { DashboardLayout } from "@/modules/dasboard/ui/layouts/dashboard-layout"

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}