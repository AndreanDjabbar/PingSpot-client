import { MainLayout } from "@/components";
import { Scrollbar } from "@/components";

const MainLayoutWrapper = ({children}: {children: React.ReactNode}) => {
    return (
        <Scrollbar>
            <MainLayout>
                {children}
            </MainLayout>
        </Scrollbar>
    )
}

export default MainLayoutWrapper;