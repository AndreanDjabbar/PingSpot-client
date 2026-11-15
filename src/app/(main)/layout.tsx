import { MainLayout } from "@/components/layouts/MainLayout";

const MainLayoutWrapper = ({children}: {children: React.ReactNode}) => {
    return (
        <MainLayout>
            {children}
        </MainLayout>
    )
}

export default MainLayoutWrapper;